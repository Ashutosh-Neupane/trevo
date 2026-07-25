"use client";

import type { FieldControlProps } from "./index";

export default function BarcodeField({ field, value }: FieldControlProps) {
  const display = typeof value === "string" ? value : "-";

  return (
    <div className="flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">
      <div className="flex h-12 w-24 items-center justify-center rounded bg-white border border-dashed border-zinc-300 dark:border-zinc-600">
        <span className="font-mono text-xs text-zinc-700 dark:text-zinc-300 break-all px-1 text-center">
          {display}
        </span>
      </div>
      <div>
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Barcode</p>
        <p className="text-xs text-zinc-500">{display}</p>
      </div>
    </div>
  );
}
