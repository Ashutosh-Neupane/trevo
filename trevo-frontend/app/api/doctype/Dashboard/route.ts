import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const name = new URL(req.url).pathname.split("/").pop();
  
  try {
    const cookie = req.headers.get("cookie") || "";
    const backendUrl = process.env.FRAPPE_BACKEND_URL || "http://localhost:8000";
    
    // Try to fetch dashboard data from Frappe
    // In Frappe, dashboards are typically workspace configurations
    const url = new URL(`${backendUrl}/api/method/frappe.desk.dashboard.get`);
    url.searchParams.set("name", name || "default");
    
    const res = await fetch(url.toString(), {
      headers: {
        Accept: "application/json",
        "X-Frappe-CSRF-Token": "fetch",
        Cookie: cookie,
      },
      cache: "no-store",
    });

    const text = await res.text();
    if (!res.ok) {
      return new Response(text, { status: res.status, headers: { "Content-Type": "application/json" } });
    }

    const envelope = JSON.parse(text) as { message?: { widgets?: unknown[] } };
    const widgets = envelope.message?.widgets ?? [];
    
    return new Response(
      JSON.stringify({
        title: name || "Dashboard",
        widgets: Array.isArray(widgets) ? widgets : [],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch {
    return new Response(
      JSON.stringify({ title: name || "Dashboard", widgets: [] }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }
}
