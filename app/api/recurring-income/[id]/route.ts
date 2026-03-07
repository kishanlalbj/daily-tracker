import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { computeNextRunDate, parseDateLocal } from "@/lib/recurring-utils";
import type { Frequency } from "@/lib/recurring-utils";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = req.headers.get("x-user-id");
    const body = await req.json();

    const existing = await prisma.recurringIncome.findFirst({
      where: { id: Number(id), userId: Number(userId) }
    });

    if (!existing) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    // Pause / resume toggle — only is_active sent
    if ("is_active" in body && Object.keys(body).length === 1) {
      const updated = await prisma.recurringIncome.update({
        where: { id: Number(id) },
        data: { is_active: body.is_active }
      });
      return NextResponse.json({ data: updated }, { status: 200 });
    }

    const { title, amount, source, frequency, start_date, end_date, is_active } = body;
    const startDateLocal = parseDateLocal(start_date);
    const nextRunDate = computeNextRunDate(startDateLocal, frequency as Frequency);

    const updated = await prisma.recurringIncome.update({
      where: { id: Number(id) },
      data: {
        title,
        amount,
        source,
        frequency,
        start_date: startDateLocal,
        end_date: end_date ? parseDateLocal(end_date) : null,
        next_run_date: nextRunDate,
        is_active: is_active ?? true
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
    const userId = req.headers.get("x-user-id");

    const existing = await prisma.recurringIncome.findFirst({
      where: { id: Number(id), userId: Number(userId) }
    });

    if (!existing) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    await prisma.recurringIncome.delete({ where: { id: Number(id) } });

    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
