import { NextRequest, NextResponse } from "next/server";
import { frappeServerFetch, getCookieHeader } from "@/lib/frappe/server";

const VALID_ACTIONS = ["Save", "Submit", "Update"];

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ doctype: string }> },
) {
  try {
    const { doctype } = await params;
    const cookie = await getCookieHeader();
    const body = await req.json();
    const action = typeof body.action === "string" && VALID_ACTIONS.includes(body.action)
      ? body.action
      : "Save";

    const { data } = await frappeServerFetch<{ data: Record<string, unknown> }>(
      cookie,
      "api/method/frappe.desk.form.save.savedocs",
      {
        method: "POST",
        body: {
          doc: JSON.stringify({ doctype, ...body }),
          action,
        },
      },
    );

    return NextResponse.json({ data, action }, { status: 201 });
  } catch (err: unknown) {
    const status = err && typeof err === "object" && "status" in err ? (err as { status: number }).status : 500;
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to save document" },
      { status: status || 500 },
    );
  }
}
