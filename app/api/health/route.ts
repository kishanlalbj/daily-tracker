export const runtime = "nodejs";
import { NextRequest, NextResponse } from "next/server";
import { calculateAverage, calculateBMI, calculateBodyFat } from "./formulas";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const userId = Number(req.headers.get("x-user-id"));

    const { weight, waist, neck } = data;

    // Get user's height and gender from User model
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { height: true, gender: true }
    });

    if (!user?.height) {
      return NextResponse.json(
        { message: "User height not set. Please update your profile." },
        { status: 400 }
      );
    }

    const heightInMeters = Number(user.height) / 100;
    const bmi = calculateBMI(weight, heightInMeters);

    const bodyFat = calculateBodyFat({
      gender: user.gender === "female" ? "female" : "male",
      height: Number(user.height),
      waist,
      neck
    });

    const bodyFatWeight = (bodyFat / 100) * weight;

    const res = await prisma.healthTracker.create({
      data: {
        weight,
        waist,
        bmi,
        bodyFat,
        bodyFatWeight,
        neck,
        userId
      }
    });

    return NextResponse.json(
      {
        data: res
      },
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

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const data = await prisma.healthTracker.findMany({
      where: {
        userId: Number(userId)
      },
      orderBy: {
        created_at: "desc"
      }
    });

    const last7DaysWeight = data.slice(-7).map((e) => Number(e.weight));
    const last7DaysBMI = data.slice(-7).map((e) => Number(e.bmi));
    const last7DaysBodyFat = data.slice(-7).map((e) => Number(e.bodyFat));

    const weightAverage = calculateAverage(last7DaysWeight);
    const bmiAverage = calculateAverage(last7DaysBMI);
    const bodyFatAverage = calculateAverage(last7DaysBodyFat);

    return NextResponse.json(
      {
        data,
        averages: {
          weight: weightAverage,
          bmi: bmiAverage,
          bodyFat: bodyFatAverage
        }
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
