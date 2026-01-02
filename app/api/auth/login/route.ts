import { generateJwtToken, verifyJwtToken, verifyPassword } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json();

    const { email, password } = body as { email: string; password: string };

    const user = await prisma.user.findFirst({
      where: {
        email,
        is_deleted: false
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: "Password or email is incorrect" },
        { status: 404 }
      );
    }

    const isMatch = await verifyPassword(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Password or email is incorrect" },
        { status: 400 }
      );
    }

    const token = await generateJwtToken({ userId: user.id });

    const verified = verifyJwtToken(token);

    const response = NextResponse.json({
      message: "Login successfull",
      data: verified,
      token
    });

    response.cookies.set("token", token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 }
    );
  }
};
