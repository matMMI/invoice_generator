import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const sessionToken =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");
  const path = request.nextUrl.pathname;

  const isAuthPage = path.startsWith("/login") || path.startsWith("/signup");
  const isProtectedPath =
    path === "/" ||
    path.startsWith("/clients") ||
    path.startsWith("/quotes") ||
    path.startsWith("/dashboard");

  if (sessionToken) {
    // Logged in user trying to access auth pages -> redirect to dashboard
    if (isAuthPage) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  } else {
    // Not logged in user trying to access protected pages -> redirect to login
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
  ],
};
