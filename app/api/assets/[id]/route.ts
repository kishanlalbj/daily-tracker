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
    const { title, value, type, date } = await req.json();

    const existing = await prisma.asset.findFirst({
      where: { id: Number(id), userId }
    });

    if (!existing) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const updated = await prisma.asset.update({
      where: { id: Number(id) },
      data: { title, value, type, date: parseDateLocal(date) }
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

    const existing = await prisma.asset.findFirst({
      where: { id: Number(id), userId }
    });

    if (!existing) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    await prisma.asset.delete({ where: { id: Number(id) } });

    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
