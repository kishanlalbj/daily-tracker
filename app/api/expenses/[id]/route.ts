import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = req.headers.get("x-user-id");
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Expense ID is required" },
        { status: 400 }
      );
    }
    const expense = await prisma.expenseTracker.findFirst({
      where: {
        id: Number(id),
        userId: Number(userId)
      }
    });

    if (!expense) {
      return NextResponse.json(
        { message: "Expense not found" },
        { status: 404 }
      );
    }

    await prisma.expenseTracker.delete({
      where: {
        id: Number(id)
      }
    });

    return NextResponse.json(
      { message: "Expense deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.log(err);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = req.headers.get("x-user-id");
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "Expense ID is required" },
        { status: 400 }
      );
    }

    const { date, expense_title, amount, category } = await req.json();

    const expense = await prisma.expenseTracker.findFirst({
      where: {
        id: Number(id),
        userId: Number(userId)
      }
    });

    if (!expense) {
      return NextResponse.json(
        { message: "Expense not found" },
        { status: 404 }
      );
    }

    const updatedExpense = await prisma.expenseTracker.update({
      where: {
        id: Number(id)
      },
      data: {
        date,
        expense_title,
        categoryId: category,
        amount
      },
      include: {
        category: {
          select: {
            title: true
          }
        }
      }
    });

    return NextResponse.json({ data: updatedExpense }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
