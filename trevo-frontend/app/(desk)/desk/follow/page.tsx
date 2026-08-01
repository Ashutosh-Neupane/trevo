"use client";

import { DocumentFollow } from "@/components/features/document-follow";

export default function FollowPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Document Follow</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Follow documents to get updates
        </p>
      </div>
      <DocumentFollow />
    </div>
  );
}
