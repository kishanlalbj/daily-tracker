import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const startOfNextMonth = new Date(startOfMonth);
    startOfNextMonth.setMonth(startOfMonth.getMonth() + 1);

    const healthData = await prisma.healthTracker.findMany({
      where: {
        userId: 1,
        created_at: {
          gte: startOfMonth,
          lt: startOfNextMonth
        }
      },
      select: {
        created_at: true,
        bmi: true,
        bodyFat: true
      },
      distinct: "created_at"
    });

    const eachDaySpends = await prisma.expenseTracker.groupBy({
      by: ["categoryId"],
      _sum: {
        amount: true
      },
      where: {
        date: {
          gte: startOfMonth,
          lt: startOfNextMonth
        }
      }
    });

    const mostSpentCategoryId = await prisma.expenseTracker.groupBy({
      by: ["categoryId"],
      _sum: {
        amount: true
      },
      where: {
        date: {
          gte: startOfMonth,
          lt: startOfNextMonth
        }
      },
      orderBy: {
        _sum: {
          amount: "desc"
        }
      },
      take: 1
    });

    const category = await prisma.category.findUnique({
      where: { id: mostSpentCategoryId[0].categoryId }
    });

    return NextResponse.json(
      {
        data: {
          healthData,
          expenseData: {
            mostSpentCategoryId,
            mostSpentCategory: category,
            eachDaySpends
          }
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
