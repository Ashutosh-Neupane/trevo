"use client";

import { PrintFormatBuilder } from "@/components/features/print-format";

export default function PrintFormatPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Print Format Builder</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Design print formats for your documents
        </p>
      </div>
      <PrintFormatBuilder />
    </div>
  );
}
