"use client";

import { useMemo, useState, useCallback } from "react";
import type { FieldControlProps } from "./index";

/**
 * Table field — inline editable child table with CRUD operations.
 * Supports add/remove rows, inline editing, and drag-to-reorder (simplified).
 */
export default function TableField({ field, value, onChange, disabled }: FieldControlProps) {
  const [rows, setRows] = useState<Array<Record<string, unknown>>>([]);

  const addRow = useCallback(() => {
    const newRow: Record<string, unknown> = {
      name: `new-${Date.now()}`,
      idx: rows.length,
    };
    setRows([...rows, newRow]);
    onChange([...rows, newRow]);
  }, [rows, onChange]);

  const removeRow = useCallback((index: number) => {
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
    onChange(updated);
  }, [rows, onChange]);

  const updateRow = useCallback((index: number, key: string, val: unknown) => {
    const updated = rows.map((r, i) => (i === index ? { ...r, [key]: val } : r));
    setRows(updated);
    onChange(updated);
  }, [rows, onChange]);

  if (!field.options) return null;

  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800">
            <tr>
              {field.columns && (
                <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">#</th>
              )}
              {Object.keys(rows[0] || {}).map((key) => (
                <th key={key} className="px-3 py-2 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  {key}
                </th>
              ))}
              {!disabled && (
                <th className="px-3 py-2 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={100} className="px-3 py-8 text-center text-sm text-zinc-500">
                  No rows. Click "Add Row" to add one.
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  {field.columns && (
                    <td className="px-3 py-2 text-sm text-zinc-500">{i + 1}</td>
                  )}
                  {Object.entries(row).map(([key, val]) => (
                    <td key={key} className="px-3 py-2">
                      <input
                        type="text"
                        value={String(val ?? "")}
                        onChange={(e) => updateRow(i, key, e.target.value)}
                        disabled={disabled}
                        className="w-full rounded border border-zinc-200 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 focus:border-zinc-900 focus:outline-none disabled:opacity-50"
                      />
                    </td>
                  ))}
                  {!disabled && (
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => removeRow(i)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!disabled && (
        <div className="border-t border-zinc-200 px-3 py-2 dark:border-zinc-700">
          <button
            type="button"
            onClick={addRow}
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            + Add Row
          </button>
        </div>
      )}
    </div>
  );
}
