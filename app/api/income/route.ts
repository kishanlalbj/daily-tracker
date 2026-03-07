import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getDateRange } from "@/app/api/dashboard/helpers";

export async function GET(req: NextRequest) {
  try {
    const userId = Number(req.headers.get("x-user-id"));
    const { searchParams } = new URL(req.url);
    const { fromDate, toDate } = getDateRange(searchParams);

    const incomes = await prisma.income.findMany({
      where: {
        userId,
        date: { gte: fromDate, lt: toDate },
        user: { is_deleted: false }
      },
      include: {
        recurringIncome: { select: { title: true } }
      },
      orderBy: { date: "desc" }
    });

    return NextResponse.json({ data: incomes }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = Number(req.headers.get("x-user-id"));
    const { id } = await req.json();

    const existing = await prisma.income.findFirst({
      where: { id: Number(id), userId }
    });

    if (!existing) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    await prisma.income.delete({ where: { id: Number(id) } });

    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
