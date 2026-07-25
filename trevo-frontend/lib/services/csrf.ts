/**
 * CSRF Protection utility for API routes.
 * Uses double-submit cookie pattern with a cryptographically random token.
 */
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const CSRF_COOKIE_NAME = "csrf-token";
const CSRF_HEADER_NAME = "x-csrf-token";

/**
 * Generate a cryptographically random CSRF token.
 */
export function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * Set the CSRF token cookie on a response.
 */
export function setCsrfCookie(response: NextResponse): NextResponse {
  const token = generateCsrfToken();
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: false, // Must be readable by client JS to send as header
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });
  return response;
}

/**
 * Validate CSRF token from request against cookie.
 * Safe methods (GET, HEAD, OPTIONS) are always allowed.
 */
export async function validateCsrf(request: Request): Promise<{ valid: boolean; reason?: string }> {
  const method = request.method.toUpperCase();
  // Safe methods don't need CSRF protection
  if (["GET", "HEAD", "OPTIONS"].includes(method)) {
    return { valid: true };
  }

  const cookieStore = await cookies();
  const cookieToken = cookieStore.get(CSRF_COOKIE_NAME)?.value;
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  if (!cookieToken || !headerToken) {
    return { valid: false, reason: "Missing CSRF token" };
  }

  if (cookieToken !== headerToken) {
    return { valid: false, reason: "CSRF token mismatch" };
  }

  return { valid: true };
}
