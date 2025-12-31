import { NextRequest, NextResponse } from "next/server";
import { verifyJwtToken } from "./lib/helpers";

const PUBLIC_PATHS = ["/", "/api/auth/login", "/api/auth/register"];
const AUTH_PATHS = ["/", "/api/auth/login", "/api/auth/register"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  let decoded: ReturnType<typeof verifyJwtToken> | null = null;

  if (token) {
    try {
      decoded = verifyJwtToken(token);
    } catch {
      decoded = null;
    }
  }

  // Logged-in user hitting auth pages → redirect
  if (decoded && AUTH_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Public paths are always allowed
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Protected paths without valid token
  if (!decoded) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Attach derived identity
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", String(decoded.userId));

  return NextResponse.next({
    request: { headers: requestHeaders }
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
