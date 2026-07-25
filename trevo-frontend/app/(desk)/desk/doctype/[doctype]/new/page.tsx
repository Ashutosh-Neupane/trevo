"use client";

import { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import FormRenderer from "@/lib/trevo-form/renderers/FormRenderer";
import { useDoctype } from "@/lib/hooks/useDoctype";
import { frappeGet } from "@/lib/frappe/client";

export default function DoctypeNewPage() {
  const params = useParams<{ doctype: string }>();
  const router = useRouter();
  const doctype = decodeURIComponent(params.doctype);

  const { data: meta, isLoading: metaLoading } = useDoctype(doctype);

  const handleSave = async (values: Record<string, unknown>) => {
    const res = await fetch(`/api/doctype/${encodeURIComponent(doctype)}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to save");
    }

    const json = await res.json();
    const newName = json.data?.name || values.name;
    router.push(`/desk/doctype/${encodeURIComponent(doctype)}/${encodeURIComponent(String(newName))}`);
  };

  const handleCancel = () => {
    router.back();
  };

  if (metaLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
      </div>
    );
  }

  if (!meta) {
    return (
      <div className="p-6 text-sm text-red-600">Failed to load DocType metadata.</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">New {doctype}</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Create a new {doctype} record
          </p>
        </div>
      </div>

      <FormRenderer
        meta={meta}
        editable={true}
        readOnly={false}
        onSave={handleSave}
        onCancel={handleCancel}
      />
    </div>
  );
}
