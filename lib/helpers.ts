import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { cookies } from "next/headers";
import prisma from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const hashedPassword = async (password: string) => {
  return await bcrypt.hash(password, 12);
};

export const verifyPassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

export const generateJwtToken = async (
  payload: Record<string, unknown> | string
) => {
  try {
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });

    return token;
  } catch (err) {
    if (err instanceof JsonWebTokenError) {
      throw err;
    } else throw new Error("Error creating JWT token");
  }
};

export const verifyJwtToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as { userId: number };
};

export const getCurrentUser = async () => {
  const cookieStore = await cookies();

  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  const decode = verifyJwtToken(token);

  const userFromDb = await prisma.user.findUnique({
    where: {
      id: decode.userId
    }
  });

  if (!userFromDb) return null;

  const { password, ...user } = userFromDb;
  console.log({ user });

  return user;
};
