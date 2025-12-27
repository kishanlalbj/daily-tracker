import prisma from "@/lib/prisma";
import { User } from "@/types";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const data = await req.json();

    const { first_name, last_name, password, email, gender } = data as User;

    const isExists = await prisma.user.findFirst({
      where: {
        email
      }
    });

    if (isExists) {
      return NextResponse.json(
        { message: "User already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await prisma.user.create({
      data: {
        first_name,
        last_name,
        email,
        password: hashedPassword,
        gender
      }
    });

    return NextResponse.json(
      {
        message: "User registered.",
        user: newUser
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        message: "Internal Server Error"
      },
      { status: 500 }
    );
  }
};
