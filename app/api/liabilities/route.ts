import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const userId = Number(req.headers.get("x-user-id"));

    const liabilities = await prisma.liability.findMany({
      where: { userId, user: { is_deleted: false } },
      orderBy: { created_at: "desc" }
    });

    return NextResponse.json({ data: liabilities }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = Number(req.headers.get("x-user-id"));
    const { title, amount, type } = await req.json();

    const liability = await prisma.liability.create({
      data: { title, amount, type, userId }
    });

    return NextResponse.json({ data: liability }, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
