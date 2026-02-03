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
    path.startsWith("/settings");

  // Validate session server-side by calling the auth API
  let isAuthenticated = false;
  if (sessionCookie?.value) {
    try {
      const baseUrl = request.nextUrl.origin;
      const res = await fetch(`${baseUrl}/auth/get-session`, {
        headers: {
          cookie: `${sessionCookie.name}=${sessionCookie.value}`,
        },
      });
      isAuthenticated = res.ok;
    } catch {
      // If validation fails, treat as unauthenticated
      isAuthenticated = false;
    }
  }

  if (isAuthenticated) {
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
  ],
};
