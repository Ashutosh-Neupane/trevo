"use client";

import { ImageView } from "@/components/features/image";

export default function ImagePage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Image View</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Browse image attachments
        </p>
      </div>
      <ImageView />
    </div>
  );
}
