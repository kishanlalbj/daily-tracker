import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const data = await req.json();

    const { firstName, lastName, password, email, gender, height } = data;

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
        first_name: firstName,
        last_name: lastName,
        email,
        password: hashedPassword,
        gender,
        height
      }
    });

    // Convert Decimal to number for client
    const serializedUser = {
      ...newUser,
      height: newUser.height ? Number(newUser.height) : null
    };

    return NextResponse.json(
      {
        message: "User registered.",
        user: serializedUser
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
