"use client";

import { useQuery } from "@tanstack/react-query";
import { frappeMethod } from "@/lib/frappe/client";
import { Card } from "@/components/shadcn/card";
import { MessageSquare, Paperclip, History } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface DocInfo {
  docinfo: {
    comments?: Array<{
      name: string;
      content: string;
      comment_by?: string;
      comment_email?: string;
      creation: string;
    }>;
    versions?: Array<{
      name: string;
      creation: string;
      owner: string;
      data?: string;
    }>;
    attachments?: Array<{
      name: string;
      file_name: string;
      file_url: string;
      file_size?: number;
      creation: string;
    }>;
  };
}

interface FormTimelineProps {
  doctype: string;
  docname: string;
}

export function FormTimeline({ doctype, docname }: FormTimelineProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["docinfo", doctype, docname],
    queryFn: async () => {
      const result = await frappeMethod<DocInfo>("frappe.desk.form.load.get_doc_info", {
        doctype,
        name: docname,
      });
      return result.docinfo;
    },
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-zinc-100 dark:bg-zinc-700" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-zinc-100 dark:bg-zinc-700" />
                <div className="h-3 w-1/2 rounded bg-zinc-100 dark:bg-zinc-700" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="p-6 text-sm text-zinc-500">
        Failed to load timeline
      </Card>
    );
  }

  const comments = data.comments ?? [];
  const versions = data.versions ?? [];
  const attachments = data.attachments ?? [];
  const items = [
    ...comments.map((c) => ({ type: "comment" as const, data: c, date: c.creation })),
    ...versions.map((v) => ({ type: "version" as const, data: v, date: v.creation })),
    ...attachments.map((a) => ({ type: "attachment" as const, data: a, date: a.creation })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">Timeline</h3>
      <div className="space-y-4">
        {items.length === 0 ? (
          <p className="text-sm text-zinc-500">No activity yet.</p>
        ) : (
          items.map((item, idx) => (
            <div key={`${item.type}-${item.data.name}-${idx}`} className="flex gap-3">
              <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-700">
                {item.type === "comment" && <MessageSquare className="h-4 w-4 text-zinc-500" />}
                {item.type === "version" && <History className="h-4 w-4 text-zinc-500" />}
                {item.type === "attachment" && <Paperclip className="h-4 w-4 text-zinc-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {item.type === "comment" && "Comment"}
                    {item.type === "version" && "Version"}
                    {item.type === "attachment" && "Attachment"}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {formatDistanceToNow(new Date(item.date), { addSuffix: true })}
                  </span>
                </div>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  {item.type === "comment" && String((item.data as { content?: string }).content ?? "")}
                  {item.type === "version" && `Document updated by ${(item.data as { owner?: string }).owner ?? "unknown"}`}
                  {item.type === "attachment" && (item.data as { file_name?: string }).file_name}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
