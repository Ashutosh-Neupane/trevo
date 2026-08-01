/**
 * POST /api/doctype/[doctype]/import
 *
 * Imports data into a Frappe DocType by proxying to Frappe's data import endpoint.
 * Accepts CSV/JSON payloads and returns the import result.
 */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { FRAPPE_BACKEND_URL } from "@/lib/frappe/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ doctype: string }> },
) {
  const { doctype } = await params;
  const cookieJar = await cookies();
  const cookieHeader = cookieJar.toString();

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const importType = (formData.get("import_type") as string) ?? "Insert New Records";
    const submitAfter = formData.get("submit_after") === "true";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert file to buffer for the Frappe API
    const buffer = Buffer.from(await file.arrayBuffer());

    // Forward to Frappe's data import endpoint
    const frappeFormData = new FormData();
    const blob = new Blob([buffer], { type: file.type || "text/csv" });
    frappeFormData.append("file", blob, file.name);
    frappeFormData.append("doctype", doctype);
    frappeFormData.append("import_type", importType);
    frappeFormData.append("submit_after", String(submitAfter));

    const res = await fetch(
      `${FRAPPE_BACKEND_URL}/api/method/frappe.data_import.importer.import_file`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
        body: (() => {
          // Build multipart form data manually for the fetch to Frappe
          const boundary = `----FormBoundary${Math.random().toString(36).substring(2)}`;
          const parts: string[] = [];

          // Helper to add a field
          const addField = (name: string, value: string) => {
            parts.push(`--${boundary}`);
            parts.push(`Content-Disposition: form-data; name="${name}"`);
            parts.push("");
            parts.push(value);
          };

          // Add the file
          const fileName = file.name;
          const fileContent = buffer.toString("base64");
          parts.push(`--${boundary}`);
          parts.push(`Content-Disposition: form-data; name="file"; filename="${fileName}"`);
          parts.push(`Content-Type: ${file.type || "text/csv"}`);
          parts.push("");
          parts.push(fileContent);

          addField("doctype", doctype);
          addField("import_type", importType);
          addField("submit_after", String(submitAfter));

          parts.push(`--${boundary}--`);
          const body = parts.join("\r\n");

          return new TextEncoder().encode(body);
        })(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    );

    // Try to parse the response
    const responseText = await res.text();
    let json;
    try {
      json = JSON.parse(responseText);
    } catch {
      json = { message: responseText };
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: json?.message || json?.exc || "Import failed" },
        { status: res.status },
      );
    }

    return NextResponse.json({
      message: "Import completed",
      data: json?.message || json?.data || json,
    });
  } catch (err) {
    console.error("Import error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Import failed" },
      { status: 500 },
    );
  }
}
