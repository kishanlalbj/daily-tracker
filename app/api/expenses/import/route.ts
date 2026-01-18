import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const POST = async (req: NextRequest) => {
  try {
    const data = await req.json();

    const result = await prisma.expenseTracker.createManyAndReturn({
      data
    });

    return NextResponse.json({
      data: result
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 }
    );
  }
};
