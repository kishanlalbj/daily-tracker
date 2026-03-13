import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getDateRange } from "@/app/api/dashboard/helpers";
import type { GlucoseMeasurementType } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const userId = Number(req.headers.get("x-user-id"));
    const { searchParams } = new URL(req.url);
    const { fromDate, toDate } = getDateRange(searchParams);

    const records = await prisma.bloodGlucose.findMany({
      where: {
        userId,
        measured_at: { gte: fromDate, lt: toDate }
      },
      orderBy: { measured_at: "desc" }
    });

    const byType: Record<GlucoseMeasurementType, number[]> = {
      fasting: [],
      post_meal: [],
      random: [],
      bedtime: []
    };

    for (const r of records) {
      const level = Number(r.glucose_level);
      byType[r.measurement_type as GlucoseMeasurementType].push(level);
    }

    const avg = (arr: number[]) =>
      arr.length ? Number((arr.reduce((s, v) => s + v, 0) / arr.length).toFixed(1)) : null;

    const averages = {
      fasting: avg(byType.fasting),
      post_meal: avg(byType.post_meal),
      random: avg(byType.random),
      bedtime: avg(byType.bedtime)
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
    const { glucose_level, measurement_type, notes, measured_at } = await req.json();

    const record = await prisma.bloodGlucose.create({
      data: {
        glucose_level: Number(glucose_level),
        measurement_type,
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
