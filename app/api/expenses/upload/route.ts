import { NextRequest, NextResponse } from "next/server";
import Papa from "papaparse";
import { cleanData, transformToExpense } from "./clean";
import { Prisma } from "@/generated/prisma/client";
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

    if (errors.length) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    // @ts-expect-error data unkown
    const cleaned = cleanData(data);
    console.log(cleaned);

    const transformed = transformToExpense(cleaned, userId, 10);

    const res = await prisma.expenseTracker.createManyAndReturn({
      data: transformed
    });

    console.log(res);

    // data is JSON array
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
