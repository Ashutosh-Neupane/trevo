"use client";

import { useQuery } from "@tanstack/react-query";
import { frappeMethod } from "@/lib/frappe/client";
import { Card } from "@/components/shadcn/card";
import { Link as LinkIcon, Loader2 } from "lucide-react";
import Link from "next/link";

interface LinkedDoc {
  name: string;
  doctype: string;
  title?: string;
  link_doctype?: string;
  link_fieldname?: string;
}

interface LinkedWithProps {
  doctype: string;
  name: string;
}

export function LinkedWith({ doctype, name }: LinkedWithProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["linked-with", doctype, name],
    queryFn: async () => {
      const result = await frappeMethod<{ docs?: LinkedDoc[] }>("frappe.desk.form.load.get_linked_docs", {
        doctype,
        name,
      });
      return result.docs ?? [];
    },
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center gap-2 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading linked documents...
        </div>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card className="p-4 text-sm text-zinc-500">
        Failed to load linked documents.
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className="p-4 text-sm text-zinc-500">
        No linked documents found.
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h3 className="mb-3 text-sm font-medium text-zinc-900 dark:text-zinc-100">Linked With</h3>
      <div className="space-y-2">
        {data.map((doc) => (
          <Link
            key={`${doc.doctype}-${doc.name}`}
            href={`/desk/doctype/${encodeURIComponent(doc.doctype)}/${encodeURIComponent(doc.name)}`}
            className="flex items-center gap-2 rounded-lg p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            <LinkIcon className="h-4 w-4 text-zinc-400" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {doc.title || doc.name}
              </p>
              <p className="truncate text-xs text-zinc-500">{doc.doctype}</p>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
