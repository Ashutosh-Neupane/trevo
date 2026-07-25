"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import FormRenderer from "@/lib/trevo-form/renderers/FormRenderer";
import { useDoctype } from "@/lib/hooks/useDoctype";
import { useDocument } from "@/lib/hooks/useDocument";
import { useSaveDocument } from "@/lib/hooks/useDocument";
import { useCancelDocument } from "@/lib/hooks/useDocument";
import { useDiscardDocument } from "@/lib/hooks/useDocument";
import { Badge } from "@/components/shadcn/badge";
import { FormSkeleton } from "@/components/Skeleton";
import { ArrowLeft } from "lucide-react";
import DocumentActions from "@/components/DocumentActions";

export default function DoctypeEditPage() {
  const params = useParams<{ doctype: string; name: string }>();
  const router = useRouter();
  const doctype = decodeURIComponent(params.doctype);
  const name = decodeURIComponent(params.name);

  const { data: meta } = useDoctype(doctype);
  const { data: doc, isLoading: docLoading } = useDocument(doctype, name, undefined, 30000);
  const saveMutation = useSaveDocument(doctype);
  const cancelMutation = useCancelDocument(doctype);
  const discardMutation = useDiscardDocument(doctype);

  const prevModifiedRef = useRef<string | undefined>(doc?.modified);

  useEffect(() => {
    if (!doc) return;
    if (prevModifiedRef.current && prevModifiedRef.current !== doc.modified) {
      toast.info("Document updated", {
        description: "This document was modified by another user or session.",
      });
    }
    prevModifiedRef.current = doc.modified;
  }, [doc]);

  const docStatusBadge = (() => {
    if (!doc) return null;
    const statuses: Record<number, { label: string; variant: "default" | "secondary" | "destructive" }> = {
      0: { label: "Draft", variant: "secondary" },
      1: { label: "Submitted", variant: "default" },
      2: { label: "Cancelled", variant: "destructive" },
    };
    const s = statuses[doc.docstatus as number] ?? { label: "Unknown", variant: "secondary" };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  })();

  if (docLoading) {
    return <FormSkeleton />;
  }

  if (!doc) {
    return (
      <div className="p-6 text-sm text-red-600">Document not found.</div>
    );
  }

  const handleSave = async (values: Record<string, unknown>) => {
    await saveMutation.mutateAsync({ doc: values, action: doc.docstatus === 1 ? "Update" : "Save" });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-lg border border-zinc-300 p-2 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            <ArrowLeft className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Edit {doctype}</h1>
              {docStatusBadge}
            </div>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{name}</p>
          </div>
        </div>
        <DocumentActions doctype={doctype} name={name} onDeleted={() => router.push(`/desk/doctype/${encodeURIComponent(doctype)}`)} />
      </div>

      <FormRenderer
        meta={meta!}
        doc={doc}
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
