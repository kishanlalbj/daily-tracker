import bcrypt from "bcryptjs";
import jwt, { JsonWebTokenError } from "jsonwebtoken";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET as string;
const secret = new TextEncoder().encode(JWT_SECRET);

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

export const verifyJwtToken = async (token: string) => {
  //   return jwt.verify(token, JWT_SECRET) as { userId: number };
  const { payload } = await jwtVerify(token, secret);

  return payload as { userId: number };
};
