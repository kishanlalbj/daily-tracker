import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { parseDateLocal } from "@/lib/recurring-utils";

export async function GET(req: NextRequest) {
  try {
    const userId = Number(req.headers.get("x-user-id"));

    const assets = await prisma.asset.findMany({
      where: { userId, user: { is_deleted: false } },
      orderBy: { date: "desc" }
    });

    return NextResponse.json({ data: assets }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = Number(req.headers.get("x-user-id"));
    const { title, value, type, date } = await req.json();

    const asset = await prisma.asset.create({
      data: {
        title,
        value,
        type,
        date: parseDateLocal(date),
        userId
      }
    });

    return NextResponse.json({ data: asset }, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
