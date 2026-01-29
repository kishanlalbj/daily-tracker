import {
  deleteExpense,
  getExpenseById,
  updateExpense
} from "@/services/expenses";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const expense = await getExpenseById(Number(userId), Number(id));

    if (!expense) {
      return NextResponse.json(
        { message: "Expense not found" },
        { status: 404 }
      );
    }

    await deleteExpense(Number(userId), Number(id));

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
  { params }: { params: Promise<{ id: string }> }
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

    const expense = await getExpenseById(Number(userId), Number(id));

    if (!expense) {
      return NextResponse.json(
        { message: "Expense not found" },
        { status: 404 }
      );
    }

    const updatedExpense = await updateExpense(Number(userId), Number(id), {
      date: new Date(date),
      expense_title,
      amount,
      categoryId: category.id,
      userId: Number(userId)
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
