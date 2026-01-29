import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getDateRange } from "../dashboard/helpers";
import { createExpense } from "@/services/expenses";

export async function POST(req: NextRequest) {
  try {
    const { date, expense_title, amount, category } = await req.json();
    const userId = req.headers.get("x-user-id");

    const payload = {
      date,
      expense_title,
      categoryId: category,
      userId: Number(userId),
      amount
    };

    const expense = await createExpense(payload);

    return NextResponse.json({ data: expense }, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");

    const { searchParams } = new URL(req.url);
    const { fromDate, toDate } = getDateRange(searchParams);
    const dateFilter = { gte: fromDate, lt: toDate };

    const expenses = await prisma.expenseTracker.findMany({
      where: {
        userId: Number(userId),
        user: {
          is_deleted: false
        },
        date: dateFilter
      },
      include: {
        category: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        date: "desc"
      }
    });

    return NextResponse.json(
      {
        data: expenses
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
