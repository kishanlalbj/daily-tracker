import { findUserById, softDeleteUser } from "@/services/users";
import { NextResponse } from "next/server";

export async function DELETE(request: Request) {
  const userId = Number(request.headers.get("x-user-id"));

  const user = await findUserById(userId);

  if (!userId || !user) {
    return NextResponse.json({ message: "User not found" }, { status: 401 });
  }

  await softDeleteUser(userId);

  const response = NextResponse.json({ message: "User deleted successfully" });

  response.cookies.delete("token");

  return response;
}
