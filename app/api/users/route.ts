import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    return NextResponse.json({ data: [] });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { messge: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("INSERTING///");
    const { name, email } = await req.json();

    return NextResponse.json(
      {
        data: { name, email }
      },
      { status: 201 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message: "Internal Server Error"
      },
      {
        status: 500
      }
    );
  }
}
