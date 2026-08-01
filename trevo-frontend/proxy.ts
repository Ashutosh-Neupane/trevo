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

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sid = request.cookies.get("sid")?.value;

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  if (isPublic) return NextResponse.next();

  if (pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  if (!sid || sid === "Guest") {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { message: "Unauthorized", error: "Authentication required" },
        { status: 401 },
      );
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
