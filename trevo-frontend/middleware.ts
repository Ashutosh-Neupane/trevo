import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/auth/login", "/api/auth/whoami", "/api/auth/logout", "/api/boot"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sid = request.cookies.get("sid")?.value;

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
  if (isPublic) return NextResponse.next();

  if (pathname.startsWith("/api/")) return NextResponse.next();

  if (pathname.startsWith("/_next") || pathname.includes(".")) return NextResponse.next();

  if (!sid || sid === "Guest") {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
