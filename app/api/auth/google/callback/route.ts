import { generateJwtToken } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import { findUserByEmail } from "@/services/users";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL("/?error=google_auth_failed", req.url)
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL("/?error=no_code", req.url));
  }

  try {
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/google/callback`
      })
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for tokens");
    }

    const userResponse = await fetch(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      }
    );

    const user = await userResponse.json();

    let dbUser = await findUserByEmail(user.email);

    if (dbUser && !dbUser.avatar) {
      await prisma.user.update({
        where: {
          email: user.email
        },
        data: {
          avatar: user.picture || ""
        }
      });
    }

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email: user.email,
          first_name: user.given_name || "",
          last_name: user.family_name || "",
          provider: "google",
          avatar: user.picture || "",
          password: null
        }
      });
    }

    const token = await generateJwtToken({ userId: dbUser.id });

    const response = NextResponse.redirect(new URL("/dashboard", req.url));
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 // 7 days
    });

    return response;
  } catch (err) {
    console.error("Google OAuth callback error:", err);
    return NextResponse.redirect(new URL("/?error=auth_failed", req.url));
  }
}
