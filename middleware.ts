import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");
  const path = request.nextUrl.pathname;

  const isAuthPage = path.startsWith("/login") || path.startsWith("/signup");
  const isProtectedPath =
    path === "/" ||
    path.startsWith("/clients") ||
    path.startsWith("/quotes") ||
    path.startsWith("/dashboard") ||
    path.startsWith("/settings") ||
    path.startsWith("/profile");

  // Check cookie presence only — actual session validation happens in API routes.
  // Calling /auth/get-session here caused rate-limit (429) storms in production.
  const hasSession = !!sessionCookie?.value;

  if (hasSession) {
    if (isAuthPage) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } else {
    if (isProtectedPath) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/signup",
    "/clients/:path*",
    "/quotes/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
};
