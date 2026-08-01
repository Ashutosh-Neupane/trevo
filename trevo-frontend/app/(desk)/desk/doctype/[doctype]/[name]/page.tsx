"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useMemo, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useDoctype } from "@/lib/hooks/useDoctype";
import { useDocument } from "@/lib/hooks/useDocument";
import { useQuery } from "@tanstack/react-query";
import { frappeMethod } from "@/lib/frappe/client";
import { Card } from "@/components/shadcn/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shadcn/tabs";
import { Badge } from "@/components/shadcn/badge";
import { FormSkeleton } from "@/components/Skeleton";
import { MessageSquare, Paperclip, History, ArrowLeft } from "lucide-react";
import DocumentActions from "@/components/DocumentActions";
import { FormTimeline } from "@/components/features/timeline";
import { AssignToDialog } from "@/components/features/bulk-operations/AssignToDialog";
import { WorkflowActions } from "@/components/features/workflow";
import { LinkedWith } from "@/components/features/linked-with";

type DocRow = Record<string, unknown>;

export default function DoctypeDetailPage() {
  const params = useParams<{ doctype: string; name: string }>();
  const router = useRouter();
  const doctype = decodeURIComponent(params.doctype);
  const name = decodeURIComponent(params.name);
  const [activeTab, setActiveTab] = useState("details");
  const [assignOpen, setAssignOpen] = useState(false);

  const { data: meta } = useDoctype(doctype);
  const { data: doc, isLoading, error } = useDocument(doctype, name, undefined, 30000);
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

  const { data: comments } = useQuery({
    queryKey: ["comments", doctype, name],
    queryFn: async () => frappeMethod<DocRow[]>("frappe.desk.form.load.get_comments", { doctype, name }),
    staleTime: 60_000,
  });

  const { data: versions } = useQuery({
    queryKey: ["versions", doctype, name],
    queryFn: async () => frappeMethod<DocRow[]>("frappe.desk.form.load.get_versions", { doctype, name }),
    staleTime: 60_000,
  });

  const { data: attachments } = useQuery({
    queryKey: ["attachments", doctype, name],
    queryFn: async () => frappeMethod<DocRow[]>("frappe.desk.form.load.get_attachments", { doctype, name }),
    staleTime: 60_000,
  });

  const fields = (meta?.fields as Array<{ fieldname: string; label?: string; fieldtype: string }> | undefined) ?? [];
  const displayFields = fields.filter(
    (f) => !["Section Break", "Column Break", "Tab Break", "Heading"].includes(f.fieldtype)
  );

  const docstatusValue = doc ? doc.docstatus : null;
  const docStatusBadge = useMemo(() => {
    if (docstatusValue === null || docstatusValue === undefined) return null;
    const statuses: Record<number, { label: string; variant: "default" | "secondary" | "destructive" }> = {
      0: { label: "Draft", variant: "secondary" },
      1: { label: "Submitted", variant: "default" },
      2: { label: "Cancelled", variant: "destructive" },
    };
    const s = statuses[docstatusValue as number] ?? { label: "Unknown", variant: "secondary" };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  }, [docstatusValue]);

  if (isLoading) return <FormSkeleton />;
  if (error) return <div className="p-4 text-sm text-red-600">{error.message}</div>;
  if (!doc) return <div className="p-4 text-sm text-zinc-600">Document not found</div>;

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
              <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{doctype}</h1>
              {docStatusBadge}
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{name}</p>
          </div>
        </div>
        <DocumentActions doctype={doctype} name={name} onDeleted={() => router.push(`/desk/doctype/${encodeURIComponent(doctype)}`)} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="comments" className="gap-1.5">
            <MessageSquare className="h-4 w-4" />
            Comments
            {comments && comments.length > 0 && (
              <span className="ml-1 rounded-full bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
                {comments.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="attachments" className="gap-1.5">
            <Paperclip className="h-4 w-4" />
            Attachments
            {attachments && attachments.length > 0 && (
              <span className="ml-1 rounded-full bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
                {attachments.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="versions" className="gap-1.5">
            <History className="h-4 w-4" />
            Version History
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-1.5">
            <MessageSquare className="h-4 w-4" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="linked">Linked With</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card className="p-0 overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {displayFields.map((f) => (
                <div key={f.fieldname} className="border-b border-r border-zinc-200 p-4 dark:border-zinc-700 sm:col-span-1">
                  <dt className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{f.label || f.fieldname}</dt>
                  <dd className="mt-1 text-sm text-zinc-900 dark:text-zinc-100">
                    {doc[f.fieldname] !== undefined && doc[f.fieldname] !== null && doc[f.fieldname] !== ""
                      ? String(doc[f.fieldname])
                      : "-"}
                  </dd>
                </div>
              ))}
            </div>
            {displayFields.length === 0 && (
              <div className="p-8 text-center text-sm text-zinc-500">No fields to display.</div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="comments">
          <Card className="p-0 overflow-hidden">
            {!comments ? (
              <div className="flex items-center justify-center p-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
              </div>
            ) : comments.length > 0 ? (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {comments.map((c: DocRow) => (
                  <div key={c.name as string} className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {(c.comment_by || c.comment_email || "Unknown") as string}
                      </span>
                      <span className="text-xs text-zinc-500">{(c.creation ? new Date(c.creation as string).toLocaleString() : "") as string}</span>
                    </div>
                    <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">{(c.content || c.comment || "-") as string}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-zinc-500">No comments yet.</div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="attachments">
          <Card className="p-0 overflow-hidden">
            {!attachments ? (
              <div className="flex items-center justify-center p-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
              </div>
            ) : attachments.length > 0 ? (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {attachments.map((a: DocRow) => (
                  <a
                    key={a.name as string}
                    href={a.file_url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <Paperclip className="h-4 w-4 text-zinc-400" />
                      <span className="text-sm text-zinc-900 dark:text-zinc-100">{(a.file_name || a.name) as string}</span>
                    </div>
                    {typeof a.file_size === "number" && (
                      <span className="text-xs text-zinc-500">{Math.round((a.file_size as number) / 1024)} KB</span>
                    )}
                  </a>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-zinc-500">No attachments.</div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="versions">
          <Card className="p-0 overflow-hidden">
            {!versions ? (
              <div className="flex items-center justify-center p-8">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
              </div>
            ) : versions.length > 0 ? (
              <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {versions.map((v: DocRow) => (
                  <div key={v.name as string} className="p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{v.name as string}</span>
                      <span className="text-xs text-zinc-500">
                        {v.creation ? new Date(v.creation as string).toLocaleString() : ""}
                      </span>
                    </div>
                    {typeof v.data !== "undefined" && v.data !== null && (
                      <pre className="mt-2 overflow-x-auto rounded-lg bg-zinc-100 p-3 text-xs text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                        {typeof v.data === "string" ? (v.data as string) : JSON.stringify(v.data, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-zinc-500">No version history.</div>
            )}
          </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <FormTimeline doctype={doctype} docname={name} />
          </TabsContent>
          <TabsContent value="workflow">
            <WorkflowActions doctype={doctype} name={name} currentState={doc?.workflow_state as string | undefined} />
          </TabsContent>
          <TabsContent value="linked">
            <LinkedWith doctype={doctype} name={name} />
          </TabsContent>
        </Tabs>

        <AssignToDialog
          open={assignOpen}
          onOpenChange={setAssignOpen}
          docnames={[name]}
          onAssign={async () => {}}
        />
      </div>
  );
}
