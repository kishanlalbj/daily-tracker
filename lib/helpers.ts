import { cookies } from "next/headers";
import prisma from "@/lib/prisma";
import { verifyJwtToken } from "@/lib/jwt";

export const getCurrentUser = async () => {
  const cookieStore = await cookies();

  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  const { userId } = await verifyJwtToken(token);

  const userFromDb = await prisma.user.findUnique({
    where: {
      id: userId
    }
  });

  if (!userFromDb) return null;

  const { password, ...user } = userFromDb;

  return {
    ...user,
    height: user.height ? Number(user.height) : null
  };
};
