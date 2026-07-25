/**
 * POST /api/auth/login
 *
 * Proxies Frappe /api/method/login, then RE-ISSUES the `sid` cookie on the
 * Next.js domain (localhost:3000). This is critical: Frappe sets `sid` with
 * SameSite=Lax on its own origin (localhost:8080), which the browser will NOT
 * send back to localhost:3000. By re-issuing it on our domain, every subsequent
 * /api/frappe/* and /api/boot request carries the session.
 */
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { FRAPPE_BACKEND_URL } from "@/lib/frappe/server";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    email?: string;
    password?: string;
  };
  const email = body?.email;
  const password = body?.password;

  if (!email || !password) {
    return NextResponse.json({ message: "Missing email/password" }, { status: 400 });
  }

  const cookieJar = await cookies();
  const cookieHeader = cookieJar.toString();

  const url = `${FRAPPE_BACKEND_URL}/api/method/login`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    body: JSON.stringify({ usr: email, pwd: password }),
  });

  const json = (await res.json().catch(() => null)) as {
    message?: string;
    home_page?: string;
    full_name?: string;
  } | null;

  if (!res.ok) {
    return NextResponse.json(
      { message: json?.message ?? "Invalid credentials" },
      { status: res.status },
    );
  }

  // Extract the `sid` value Frappe set and re-issue it on OUR domain.
  const setCookies = res.headers.getSetCookie?.() ?? [];
  const response = NextResponse.json(json ?? { message: "Logged In" }, { status: 200 });

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
    response.cookies.set("sid", sidValue, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days, matches Frappe default
    });
  }

  return response;
}
