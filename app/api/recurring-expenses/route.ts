import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { computeNextRunDate, parseDateLocal } from "@/lib/recurring-utils";
import type { Frequency } from "@/lib/recurring-utils";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");

    const recurring = await prisma.recurringExpense.findMany({
      where: {
        userId: Number(userId),
        user: { is_deleted: false }
      },
      include: {
        category: { select: { title: true } }
      },
      orderBy: { created_at: "desc" }
    });

    return NextResponse.json({ data: recurring }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { expense_title, amount, category, frequency, start_date, end_date } =
      await req.json();
    const userId = req.headers.get("x-user-id");

    const startDateLocal = parseDateLocal(start_date);
    const nextRunDate = computeNextRunDate(startDateLocal, frequency as Frequency);

    const recurring = await prisma.recurringExpense.create({
      data: {
        expense_title,
        amount,
        frequency,
        start_date: startDateLocal,
        end_date: end_date ? parseDateLocal(end_date) : null,
        next_run_date: nextRunDate,
        categoryId: category,
        userId: Number(userId)
      },
      include: {
        category: { select: { title: true } }
      }
    });

    return NextResponse.json({ data: recurring }, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
