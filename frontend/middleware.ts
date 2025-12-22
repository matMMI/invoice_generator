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

  if (sessionToken) {
    if (isAuthPage || isRootPage) {
      return NextResponse.redirect(new URL("/clients", request.url));
    }
  } else {
    if (isProtectedPath) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/login", "/signup", "/clients/:path*", "/dashboard/:path*"],
};
