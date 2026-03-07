import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params;
    const userId = Number(req.headers.get("x-user-id"));

    const existing = await prisma.budgetLimit.findUnique({
      where: { userId_categoryId: { userId, categoryId: Number(categoryId) } }
    });

    if (!existing) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    await prisma.budgetLimit.delete({
      where: { userId_categoryId: { userId, categoryId: Number(categoryId) } }
    });

    return NextResponse.json({ message: "Deleted successfully" }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
