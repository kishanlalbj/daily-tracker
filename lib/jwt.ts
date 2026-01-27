import bcrypt from "bcryptjs";
import { jwtVerify, SignJWT, errors } from "jose";

const JWT_SECRET = process.env.JWT_SECRET as string;
const secret = new TextEncoder().encode(JWT_SECRET);

export const hashedPassword = async (password: string) => {
  return await bcrypt.hash(password, 12);
};

export const verifyPassword = async (password: string, hash: string) => {
  return await bcrypt.compare(password, hash);
};

export const generateJwtToken = async (payload: Record<string, unknown>) => {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1d")
    .setIssuer("daily-tracker")
    .setIssuedAt()
    .setAudience("daily-tracker-web")
    .sign(secret);
};

export const verifyJwtToken = async (token: string) => {
  const { payload } = await jwtVerify(token, secret);

  return payload as { userId: number };
};

export const requiresAuth = async (token: string) => {
  try {
    const { payload } = await jwtVerify(token, secret, {
      issuer: "daily-tracker",
      audience: "daily-tracker-web",
      algorithms: ["HS256"]
    });
    return payload as { userId: number };
  } catch (error) {
    if (error === errors.JWTClaimValidationFailed) {
      return null;
    }
  }
};
