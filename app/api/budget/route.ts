import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const userId = Number(req.headers.get("x-user-id"));

    const limits = await prisma.budgetLimit.findMany({
      where: { userId },
      include: { category: { select: { id: true, title: true } } },
      orderBy: { created_at: "asc" }
    });

    return NextResponse.json({ data: limits }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = Number(req.headers.get("x-user-id"));
    const { categoryId, amount } = await req.json();

    const limit = await prisma.budgetLimit.upsert({
      where: { userId_categoryId: { userId, categoryId: Number(categoryId) } },
      create: { userId, categoryId: Number(categoryId), amount },
      update: { amount },
      include: { category: { select: { id: true, title: true } } }
    });

    return NextResponse.json({ data: limit }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
