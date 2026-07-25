import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Paths that do not require authentication */
const PUBLIC_PATHS = [
  "/login",
  "/api/auth/login",
  "/api/auth/whoami",
  "/api/auth/logout",
  "/api/boot",
];

/**
 * Middleware guards authenticated routes.
 *
 * Security improvements over original:
 * 1. API routes now return 401 instead of allowing unauthenticated access
 * 2. Static path checking is stricter
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sid = request.cookies.get("sid")?.value;

  // Allow public paths without authentication
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  if (isPublic) return NextResponse.next();

  // Allow static assets
  if (pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  // Check authentication
  if (!sid || sid === "Guest") {
    // API routes - return proper 401 instead of redirecting
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { message: "Unauthorized", error: "Authentication required" },
        { status: 401 },
      );
    }

    // Page routes - redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
