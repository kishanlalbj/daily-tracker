import prisma from "@/lib/prisma";
import { findUserById, updateUser } from "@/services/users";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");

    const user = await findUserById(Number(userId));

    return NextResponse.json({ data: user }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { messge: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    const data = await req.json();
    const { firstName, lastName, gender, height, email } = data;

    // Check if email is being changed and if it's already taken
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email,
          NOT: {
            id: Number(userId)
          }
        }
      });

      if (existingUser) {
        return NextResponse.json(
          { message: "Email already in use" },
          { status: 409 }
        );
      }
    }

    const updatedUser = await updateUser(Number(userId), {
      first_name: firstName,
      last_name: lastName,
      email,
      gender,
      height
    });

    // Convert Decimal to number for client
    const serializedUser = {
      ...updatedUser,
      height: updatedUser.height ? Number(updatedUser.height) : null
    };

    return NextResponse.json({ data: serializedUser }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
