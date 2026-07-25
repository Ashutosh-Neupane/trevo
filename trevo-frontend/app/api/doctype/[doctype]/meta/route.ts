import { NextResponse } from "next/server";
import { frappeServerFetch, getCookieHeader } from "@/lib/frappe/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ doctype: string }> },
) {
  try {
    const { doctype } = await params;
    const cookie = await getCookieHeader();
    const { data } = await frappeServerFetch<Record<string, unknown>>(
      cookie,
      `api/resource/DocType/${encodeURIComponent(doctype)}`,
    );

    if (!data) {
      return NextResponse.json({ error: "DocType not found" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (err: unknown) {
    const status = err && typeof err === "object" && "status" in err ? (err as { status: number }).status : 500;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to fetch metadata" },
      { status: status || 500 },
    );
  }
}
