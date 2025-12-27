import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import {
  calculateTrend,
  getDateRange,
  getDailyExpenses,
  getBodyComposition,
  calculateIdealWeight,
  calculateWeightGoal
} from "./helpers";

export async function GET(req: NextRequest) {
  try {
    const userId = Number(req.headers.get("x-user-id"));
    const { searchParams } = new URL(req.url);
    const { fromDate, toDate } = getDateRange(searchParams);

    const dateFilter = { gte: fromDate, lt: toDate };

    // Parallel data fetching
    const [
      healthData,
      latestHealthMetrics,
      user,
      totalExpense,
      categoryWiseSpends,
      allExpenses,
      recentTransactions,
      previousPeriodExpense
    ] = await Promise.all([
      // Health data
      prisma.healthTracker.findMany({
        where: { userId, created_at: dateFilter },
        select: {
          created_at: true,
          weight: true,
          bmi: true,
          bodyFat: true,
          waist: true,
          neck: true
        },
        orderBy: { created_at: "asc" }
      }),

      // Latest health metrics
      prisma.healthTracker.findFirst({
        where: { userId },
        orderBy: { created_at: "desc" }
      }),

      // User data for gender
      prisma.user.findUnique({
        where: { id: userId },
        select: { gender: true }
      }),

      // Total expenses
      prisma.expenseTracker.aggregate({
        where: { userId, date: dateFilter },
        _sum: { amount: true },
        _count: { id: true },
        _avg: { amount: true }
      }),

      // Category-wise spending
      prisma.expenseTracker.groupBy({
        by: ["categoryId"],
        _sum: { amount: true },
        _count: { id: true },
        where: { userId, date: dateFilter },
        orderBy: { _sum: { amount: "desc" } }
      }),

      // All expenses for daily trend
      prisma.expenseTracker.findMany({
        where: { userId, date: dateFilter },
        select: { date: true, amount: true },
        orderBy: { date: "asc" }
      }),

      // Recent transactions
      prisma.expenseTracker.findMany({
        where: { userId, date: dateFilter },
        include: { category: true },
        orderBy: { date: "desc" },
        take: 10
      }),

      // Previous period for comparison
      (async () => {
        const periodDays = Math.ceil(
          (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const previousFromDate = new Date(fromDate);
        previousFromDate.setDate(fromDate.getDate() - periodDays);

        return prisma.expenseTracker.aggregate({
          where: {
            userId,
            date: { gte: previousFromDate, lt: fromDate }
          },
          _sum: { amount: true }
        });
      })()
    ]);

    // Fetch categories
    const categoryIds = categoryWiseSpends.map((item) => item.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } }
    });

    // Process category breakdown
    const totalAmount = Number(totalExpense._sum.amount || 0);
    const categoryBreakdown = categoryWiseSpends.map((spend) => {
      const category = categories.find((cat) => cat.id === spend.categoryId);
      const amount = Number(spend._sum.amount || 0);

      return {
        categoryId: spend.categoryId,
        category: category?.title || "Unknown",
        total: amount,
        transactionCount: spend._count.id,
        percentage:
          totalAmount > 0
            ? Number(((amount / totalAmount) * 100).toFixed(2))
            : 0
      };
    });

    // Calculate trends
    const healthTrends = {
      weight: calculateTrend(healthData, "weight"),
      bmi: calculateTrend(healthData, "bmi"),
      bodyFat: calculateTrend(healthData, "bodyFat")
    };

    // Calculate body composition
    const bodyComposition = getBodyComposition(
      healthTrends.weight.direction,
      healthTrends.bodyFat.direction
    );

    // Calculate ideal weight and weight goal
    let idealWeight: number | null = null;
    let weightGoal: {
      message: string;
      difference: number;
      color: string;
    } | null = null;

    if (latestHealthMetrics?.height && user?.gender) {
      const heightInCm = Number(latestHealthMetrics.height);
      const heightInMeters = heightInCm / 100; // Convert cm to meters
      const currentWeight = Number(latestHealthMetrics.weight);

      idealWeight = calculateIdealWeight(heightInMeters, user.gender);
      weightGoal = calculateWeightGoal(currentWeight, idealWeight);
    }

    const dailyExpenses = getDailyExpenses(allExpenses, fromDate, toDate);

    // Calculate expense trend
    const previousAmount = Number(previousPeriodExpense._sum.amount || 0);
    const currentAmount = totalAmount;
    const expenseChange =
      previousAmount > 0
        ? Number(
            (((currentAmount - previousAmount) / previousAmount) * 100).toFixed(
              2
            )
          )
        : 0;

    let expenseDirection: "up" | "down" | "stable" = "stable";
    if (previousAmount > 0) {
      if (currentAmount > previousAmount * 1.01) expenseDirection = "up";
      else if (currentAmount < previousAmount * 0.99) expenseDirection = "down";
    }

    return NextResponse.json({
      data: {
        dateRange: { from: fromDate, to: toDate },
        health: {
          latest: latestHealthMetrics,
          trends: healthData,
          trendDirections: healthTrends,
          bodyComposition,
          idealWeight,
          weightGoal
        },
        expenses: {
          summary: {
            total: totalAmount,
            transactionCount: totalExpense._count.id || 0,
            average: Number(totalExpense._avg.amount || 0),
            changeFromPreviousPeriod: expenseChange
          },
          trends: dailyExpenses,
          trendDirections: {
            total: { direction: expenseDirection, change: expenseChange }
          },
          topSpendingCategory: categoryBreakdown[0] || null,
          categoryBreakdown,
          recentTransactions
        }
      }
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
