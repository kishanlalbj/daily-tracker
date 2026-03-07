import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = Number(req.headers.get("x-user-id"));
    const { title, amount, type } = await req.json();

    const existing = await prisma.liability.findFirst({
      where: { id: Number(id), userId }
    });

    if (!existing) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const updated = await prisma.liability.update({
      where: { id: Number(id) },
      data: { title, amount, type }
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

    const existing = await prisma.liability.findFirst({
      where: { id: Number(id), userId }
    });

    if (!existing) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    await prisma.liability.delete({ where: { id: Number(id) } });

    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
