"use client";

import { useParams, useRouter } from "next/navigation";
import FormRenderer from "@/lib/trevo-form/renderers/FormRenderer";
import { useDoctype } from "@/lib/hooks/useDoctype";
import { useDocument } from "@/lib/hooks/useDocument";
import { useSaveDocument } from "@/lib/hooks/useDocument";
import { useCancelDocument } from "@/lib/hooks/useDocument";
import { useDiscardDocument } from "@/lib/hooks/useDocument";

export default function DoctypeEditPage() {
  const params = useParams<{ doctype: string; name: string }>();
  const router = useRouter();
  const doctype = decodeURIComponent(params.doctype);
  const name = decodeURIComponent(params.name);

  const { data: meta } = useDoctype(doctype);
  const { data: doc, isLoading: docLoading } = useDocument(doctype, name);
  const saveMutation = useSaveDocument(doctype);
  const cancelMutation = useCancelDocument(doctype);
  const discardMutation = useDiscardDocument(doctype);

  const handleSave = async (values: Record<string, unknown>) => {
    await saveMutation.mutateAsync({ doc: values, action: doc?.docstatus === 1 ? "Update" : "Save" });
    router.push(`/desk/doctype/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    await saveMutation.mutateAsync({ doc: values, action: "Submit" });
    router.push(`/desk/doctype/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`);
  };

  const handleCancel = async () => {
    await cancelMutation.mutateAsync(name);
    router.push(`/desk/doctype/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`);
  };

  const handleDiscard = async () => {
    await discardMutation.mutateAsync(name);
    router.push(`/desk/doctype/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`);
  };

  if (docLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="p-6 text-sm text-red-600">Document not found.</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Edit {doctype}</h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {name} · {doc.docstatus === 0 ? "Draft" : doc.docstatus === 1 ? "Submitted" : "Cancelled"}
          </p>
        </div>
      </div>

      <FormRenderer
        meta={meta!}
        document={doc}
        editable={true}
        readOnly={doc.docstatus !== 0}
        onSave={handleSave}
        onSubmit={doc?.docstatus === 0 ? handleSubmit : undefined}
        onCancel={handleCancel}
        onDiscard={doc?.docstatus === 0 ? handleDiscard : undefined}
      />
    </div>
  );
}
