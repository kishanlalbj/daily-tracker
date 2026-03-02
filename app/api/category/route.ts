import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const categories = await prisma.category.findMany();

    return NextResponse.json({ data: categories }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title } = await request.json();

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { message: "Category title is required" },
        { status: 400 }
      );
    }

    const category = await prisma.category.create({
      data: { title: title.trim() }
    });

    return NextResponse.json({ data: category }, { status: 201 });
  } catch (error: unknown) {
    const isPrismaUniqueError =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code: string }).code === "P2002";

    if (isPrismaUniqueError) {
      return NextResponse.json(
        { message: "Category already exists" },
        { status: 409 }
      );
    }

    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
