import prisma from "@/lib/prisma";

type ExpenseForm = {
  date: Date;
  expense_title: string;
  categoryId: number;
  userId: number;
  amount: number;
};

export const getExpenseById = async (userId: number, expenseId: number) => {
  try {
    const expense = await prisma.expenseTracker.findFirst({
      where: {
        id: expenseId,
        userId: userId
      },
      include: {
        category: {
          select: {
            title: true
          }
        }
      }
    });

    return expense;
  } catch (error) {
    throw error;
  }
};

export const createExpense = async (expense: ExpenseForm) => {
  try {
    const savedExpense = await prisma.expenseTracker.create({
      data: expense,
      include: {
        category: {
          select: {
            title: true
          }
        }
      }
    });

    console.log({ savedExpense });

    return savedExpense;
  } catch (error) {
    throw error;
  }
};

export const updateExpense = async (
  userId: number,
  expenseId: number,
  data: ExpenseForm
) => {
  try {
    const updatedExpense = await prisma.expenseTracker.update({
      where: {
        id: expenseId,
        userId: userId
      },
      data,
      include: {
        category: {
          select: {
            title: true
          }
        }
      }
    });

    return updatedExpense;
  } catch (error) {
    throw error;
  }
};

export const deleteExpense = async (userId: number, expenseId: number) => {
  try {
    const deletedExpense = await prisma.expenseTracker.delete({
      where: {
        id: Number(expenseId),
        userId: Number(userId)
      }
    });

    return deletedExpense;
  } catch (error) {
    throw error;
  }
};
