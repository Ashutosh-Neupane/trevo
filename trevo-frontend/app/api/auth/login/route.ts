/**
 * POST /api/auth/login
 *
 * Proxies Frappe /api/method/login, then RE-ISSUES the `sid` cookie on the
 * Next.js domain (localhost:3000). This is critical: Frappe sets `sid` with
 * SameSite=Lax on its own origin (localhost:8000), which the browser will NOT
 * send back to localhost:3000. By re-issuing it on our domain, every subsequent
 * /api/frappe/* and /api/boot request carries the session.
 *
 * Security improvements:
 * - Rate limiting to prevent brute force attacks
 * - Input validation for email format
 * - Generic error messages to avoid user enumeration
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { FRAPPE_BACKEND_URL } from "@/lib/frappe/server";
import { checkRateLimit } from "@/lib/services/rateLimiter";

// Simple email regex validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  // Get client IP for rate limiting
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";

  // Check rate limit: max 5 login attempts per IP per 60 seconds
  const rateLimit = checkRateLimit(`login:${ip}`, {
    maxRequests: 5,
    windowSeconds: 60,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { message: "Too many login attempts. Please try again later." },
      {
        status: 429,
        headers: rateLimit.headers,
      },
    );
  }

  // Parse and validate request body
  let body: { email?: string; password?: string };
  try {
    body = (await req.json()) as { email?: string; password?: string };
  } catch {
    return NextResponse.json(
      { message: "Invalid request body" },
      { status: 400 },
    );
  }

  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { message: "Email and password are required" },
      { status: 400 },
    );
  }

  // Validate email format
  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json(
      { message: "Invalid email format" },
      { status: 400 },
    );
  }

  // Validate password is not empty
  if (password.length < 1) {
    return NextResponse.json(
      { message: "Password is required" },
      { status: 400 },
    );
  }

  const cookieJar = await cookies();
  const cookieHeader = cookieJar.toString();

  const url = `${FRAPPE_BACKEND_URL}/api/method/login`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: JSON.stringify({ usr: email, pwd: password }),
    });
  } catch {
    return NextResponse.json(
      { message: "Authentication service unavailable" },
      { status: 503 },
    );
  }

  const json = (await res.json().catch(() => null)) as {
    message?: string;
    home_page?: string;
    full_name?: string;
  } | null;

  if (!res.ok) {
    // Use generic error message to prevent user enumeration
    return NextResponse.json(
      { message: "Invalid credentials" },
      {
        status: 401,
        headers: rateLimit.headers,
      },
    );
  }

  // Extract the `sid` value Frappe set and re-issue it on OUR domain.
  const setCookies = res.headers.getSetCookie?.() ?? [];
  const response = NextResponse.json(
    json ?? { message: "Logged In" },
    { status: 200, headers: rateLimit.headers },
  );

  let sidValue: string | null = null;
  for (const sc of setCookies) {
    // Parse the sid cookie out of the Set-Cookie header
    const sidMatch = sc.match(/^sid=([^;]+)/);
    if (sidMatch) {
      sidValue = sidMatch[1];
    }
  }

  if (sidValue) {
    // Re-issue sid on Next domain so the browser sends it back to us.
    // HttpOnly so client JS can't read it; SameSite Lax for top-level navs.
    // Secure flag enabled in production to ensure HTTPS-only transmission.
    response.cookies.set("sid", sidValue, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days, matches Frappe default
    });
  }

  return response;
}
