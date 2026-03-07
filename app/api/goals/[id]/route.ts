import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { parseDateLocal } from "@/lib/recurring-utils";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = Number(req.headers.get("x-user-id"));
    const body = await req.json();

    const existing = await prisma.financialGoal.findFirst({
      where: { id: Number(id), userId }
    });

    if (!existing) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const { title, target_amount, target_date, is_achieved } = body;

    const updated = await prisma.financialGoal.update({
      where: { id: Number(id) },
      data: {
        title,
        target_amount,
        target_date: target_date ? parseDateLocal(target_date) : undefined,
        is_achieved: is_achieved ?? existing.is_achieved
      }
    });

    return NextResponse.json({ data: updated }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = Number(req.headers.get("x-user-id"));

    const existing = await prisma.financialGoal.findFirst({
      where: { id: Number(id), userId }
    });

    if (!existing) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    await prisma.financialGoal.delete({ where: { id: Number(id) } });

    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
