import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getDateRange } from "@/app/api/dashboard/helpers";

export async function GET(req: NextRequest) {
  try {
    const userId = Number(req.headers.get("x-user-id"));
    const { searchParams } = new URL(req.url);
    const { fromDate, toDate } = getDateRange(searchParams);

    const records = await prisma.bloodPressure.findMany({
      where: {
        userId,
        measured_at: { gte: fromDate, lt: toDate }
      },
      orderBy: { measured_at: "desc" }
    });

    const systolicVals = records.map((r) => r.systolic);
    const diastolicVals = records.map((r) => r.diastolic);
    const pulseVals = records.filter((r) => r.pulse !== null).map((r) => r.pulse as number);

    const avg = (arr: number[]) =>
      arr.length ? Number((arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(1)) : null;

    const averages = {
      systolic: avg(systolicVals),
      diastolic: avg(diastolicVals),
      pulse: avg(pulseVals)
    };

    return NextResponse.json({ data: records, averages }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = Number(req.headers.get("x-user-id"));
    const { systolic, diastolic, pulse, notes, measured_at } = await req.json();

    const record = await prisma.bloodPressure.create({
      data: {
        systolic: Number(systolic),
        diastolic: Number(diastolic),
        pulse: pulse ? Number(pulse) : null,
        notes: notes || null,
        measured_at: new Date(measured_at),
        userId
      }
    });

    return NextResponse.json({ data: record }, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
