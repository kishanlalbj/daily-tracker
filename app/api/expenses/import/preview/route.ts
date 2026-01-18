import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { cleanData, transformToExpense } from "./clean";
import { classifyTransactions } from "./classify-transactions";
import prisma from "@/lib/prisma";

export const POST = async (req: NextRequest) => {
  try {
    const formData = await req.formData();

    const userId = Number(req.headers.get("x-user-id"));

    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    const csvText = await file.text();

    const { data, errors } = Papa.parse(csvText, {
      header: true, // first row → keys
      skipEmptyLines: true
    });

    const categories = await prisma.category.findMany();

    if (errors.length) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // @ts-expect-error data unkown
    const cleaned = cleanData(data);

    const classified = await classifyTransactions(categories, cleaned);

    const enrichedData = cleaned.map((item, index) => ({
      ...item,
      categoryId: classified[index]?.categoryId || null,
      category: classified[index]?.category || null
    }));

    const transformed = transformToExpense(enrichedData, userId);

    return NextResponse.json({
      rows: data.length,
      data: transformed
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 }
    );
  }
};
