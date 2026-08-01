"use client";

import type { FieldControlProps } from "./index";

export default function CheckField({ field, value, onChange, disabled }: FieldControlProps) {
  const checked = typeof value === "boolean" ? value : false;

  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled || !!field.read_only}
          className="peer sr-only"
        />
        <div className={[
          "w-10 h-6 rounded-full transition-colors",
          checked
            ? "bg-zinc-900 dark:bg-zinc-100"
            : "bg-zinc-200 dark:bg-zinc-700",
          (disabled || !!field.read_only) && "opacity-50 cursor-not-allowed",
        ].join(" ")}>
          <div className={[
            "absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform",
            checked && "translate-x-4",
          ].join(" ")} />
        </div>
      </div>
      {field.label && (
        <span className="text-sm text-zinc-700 dark:text-zinc-300">{field.label}</span>
      )}
    </label>
  );
}
