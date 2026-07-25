"use client";

import type { FieldControlProps } from "./index";

export default function CodeField({ field, value, onChange, disabled }: FieldControlProps) {
  return (
    <textarea
      id={field.fieldname}
      value={String(value ?? "")}
      onChange={(e) => onChange(e.target.value || null)}
      readOnly={!!field.read_only}
      disabled={disabled || !!field.read_only}
      placeholder={String(field.placeholder ?? "")}
      rows={6}
      className="w-full rounded-lg border border-zinc-300 bg-zinc-900 px-3 py-2 font-mono text-sm text-zinc-100 focus:border-zinc-900 focus:ring-zinc-900/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-100 focus:outline-none focus:ring-2"
    />
  );
}
