import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { parseDateLocal } from "@/lib/recurring-utils";

export async function GET(req: NextRequest) {
  try {
    const userId = Number(req.headers.get("x-user-id"));

    const goals = await prisma.financialGoal.findMany({
      where: { userId, user: { is_deleted: false } },
      orderBy: { target_date: "asc" }
    });

    return NextResponse.json({ data: goals }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = Number(req.headers.get("x-user-id"));
    const { title, target_amount, target_date } = await req.json();

    const goal = await prisma.financialGoal.create({
      data: {
        title,
        target_amount,
        target_date: parseDateLocal(target_date),
        userId
      }
    });

    return NextResponse.json({ data: goal }, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
