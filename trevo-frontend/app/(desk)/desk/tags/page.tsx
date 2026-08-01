"use client";

import { TagEditor } from "@/components/features/tags";

export default function TagsPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Tags</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Manage document tags
        </p>
      </div>
      <TagEditor />
    </div>
  );
}
