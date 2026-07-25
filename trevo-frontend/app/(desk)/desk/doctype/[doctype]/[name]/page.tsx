"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useDoctype } from "@/lib/hooks/useDoctype";
import { useDocument } from "@/lib/hooks/useDocument";

export default function DoctypeDetailPage() {
  const params = useParams<{ doctype: string; name: string }>();
  const router = useRouter();
  const doctype = decodeURIComponent(params.doctype);
  const name = decodeURIComponent(params.name);

  const { data: meta } = useDoctype(doctype);
  const { data: doc, isLoading, error } = useDocument(doctype, name);

  if (isLoading) return <div className="p-4 text-sm text-zinc-600">Loading...</div>;
  if (error) return <div className="p-4 text-sm text-red-600">{error.message}</div>;
  if (!doc) return <div className="p-4 text-sm text-zinc-600">Document not found</div>;

  const fields = (meta?.fields as Array<{ fieldname: string; label?: string; fieldtype: string }> | undefined) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900">{doctype}</h1>
          <p className="text-sm text-zinc-600">{doc.name}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/desk/doctype/${encodeURIComponent(doctype)}/${encodeURIComponent(doc.name)}/edit`}
            className="rounded border px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            Edit
          </Link>
          <button
            onClick={() => router.push(`/desk/doctype/${encodeURIComponent(doctype)}`)}
            className="rounded border px-3 py-1.5 text-sm font-medium text-zinc-900 hover:bg-zinc-50"
          >
            Back
          </button>
        </div>
      </div>

      <div className="rounded border bg-white p-6">
        <dl className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">
          {fields
            .filter((f) => !["Section Break", "Column Break", "Tab Break", "Heading"].includes(f.fieldtype))
            .map((f) => (
              <div key={f.fieldname} className="sm:col-span-1">
                <dt className="text-sm font-medium text-zinc-500">{f.label || f.fieldname}</dt>
                <dd className="mt-1 text-sm text-zinc-900">
                  {doc[f.fieldname] !== undefined ? String(doc[f.fieldname]) : "-"}
                </dd>
              </div>
            ))}
        </dl>
      </div>
    </div>
  );
}
