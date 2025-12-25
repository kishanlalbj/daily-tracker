import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    // const healthData = await prisma.healthTracker.aggregate
  } catch (error) {
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 200 }
    );
  }
}
