import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  const userId = request.headers.get("x-user-id");

  const user = await prisma.user.findUnique({
    where: { id: Number(userId), is_deleted: false }
  });

  if (!userId || !user) {
    return NextResponse.json({ message: "User not found" }, { status: 401 });
  }

  await prisma.user.update({
    where: { id: Number(userId) },
    data: { is_deleted: true }
  });

  const response = NextResponse.json({ message: "User deleted successfully" });

  response.cookies.delete("token");

  return response;
}
