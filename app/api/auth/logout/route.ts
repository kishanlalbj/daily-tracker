import { NextResponse } from "next/server";

export const POST = async () => {
  const response = NextResponse.json({ message: "Logged out" });

  response.cookies.delete("token");

  return response;
};
