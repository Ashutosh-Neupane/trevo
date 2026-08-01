"use client";

import { FileBrowser } from "@/components/features/files";

export default function FilesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">File Manager</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Browse, upload, and manage files
        </p>
      </div>
      <FileBrowser />
    </div>
  );
}
