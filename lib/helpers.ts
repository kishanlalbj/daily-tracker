import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { requiresAuth } from "@/lib/jwt";
import { User } from "@/types";

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const { userId } = await requiresAuth(token);

    const userFromDb = await prisma.user.findUnique({
      where: {
        id: userId
      }
    });

    if (!userFromDb) return null;

    const { password, ...user } = userFromDb;

    console.log({
      ...user,
      height: user.height
    });

    return {
      ...user,
      height: Number(user.height)
    } as User;
  } catch (err) {
    return null;
  }
};
