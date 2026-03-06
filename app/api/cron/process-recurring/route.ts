import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { advanceByFrequency } from "@/lib/recurring-utils";
import type { Frequency } from "@/lib/recurring-utils";
import { startOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization");
  if (secret !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = startOfDay(new Date());

    const due = await prisma.recurringExpense.findMany({
      where: {
        is_active: true,
        next_run_date: { lte: today }
      }
    });

    const processed = await Promise.all(
      due.map(async (rec) => {
        await prisma.expenseTracker.create({
          data: {
            date: today,
            expense_title: rec.expense_title,
            amount: rec.amount,
            categoryId: rec.categoryId,
            userId: rec.userId,
            recurringExpenseId: rec.id
          }
        });

        const nextRun = advanceByFrequency(rec.next_run_date, rec.frequency as Frequency);
        const shouldDeactivate = rec.end_date != null && nextRun > rec.end_date;

        await prisma.recurringExpense.update({
          where: { id: rec.id },
          data: {
            last_run_date: today,
            next_run_date: nextRun,
            is_active: shouldDeactivate ? false : true
          }
        });

        return rec.id;
      })
    );

    return NextResponse.json(
      { message: `Processed ${processed.length} recurring expenses`, processed },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
