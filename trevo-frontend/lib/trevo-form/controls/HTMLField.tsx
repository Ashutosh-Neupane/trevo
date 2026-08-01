"use client";

import type { FieldControlProps } from "./index";

 
export default function HTMLField({ field: _field, value }: FieldControlProps) {
  return (
    <div
      className="prose dark:prose-invert max-w-none rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-900"
      dangerouslySetInnerHTML={{ __html: String(value ?? "") }}
    />
  );
}
