import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const sessionToken =
    request.cookies.get("better-auth.session_token") ||
    request.cookies.get("__Secure-better-auth.session_token");
  const path = request.nextUrl.pathname;

  const isAuthPage = path.startsWith("/login") || path.startsWith("/signup");
  const isRootPage = path === "/";
  const isProtectedPath =
    path.startsWith("/clients") || path.startsWith("/dashboard");

  // If user is logged in
  if (sessionToken) {
    // Redirect Auth pages and Root page to Clients Dashboard
    if (isAuthPage || isRootPage) {
      return NextResponse.redirect(new URL("/clients", request.url));
    }
  }
  // If user is NOT logged in
  else {
    // Redirect Protected pages to Login
    if (isProtectedPath) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // Note: We leave Root page (/) accessible for unauthed users (Landing Page)
    // unless you want to force login for the whole app.
    // If user explicitly asked for / to be protected:
    // if (isRootPage) return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/signup", "/clients/:path*", "/dashboard/:path*"],
};
