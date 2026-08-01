"use client";

import { useState, useMemo } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Card } from "@/components/shadcn/card";
import { Input } from "@/components/shadcn/input";
import type { FormBuilderField } from "./types";

interface FieldPaletteProps {
  fields: FormBuilderField[];
}

function DraggableField({ field }: { field: FormBuilderField }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: field.fieldname,
    data: field,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`flex cursor-grab items-center gap-2 rounded-lg border p-2 text-sm ${
        isDragging
          ? "border-blue-300 bg-blue-50 opacity-50 dark:border-blue-700 dark:bg-blue-900/20"
          : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600"
      }`}
    >
      <div className="h-6 w-6 flex-shrink-0 rounded bg-zinc-100 dark:bg-zinc-700" />
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-zinc-700 dark:text-zinc-300">{field.label || field.fieldname}</p>
        <p className="truncate text-[10px] text-zinc-400">{field.fieldtype}</p>
      </div>
    </div>
  );
}

export function FieldPalette({ fields }: FieldPaletteProps) {
  const [search, setSearch] = useState("");

  const filteredFields = useMemo(() => {
    if (!search.trim()) return fields;
    const q = search.toLowerCase();
    return fields.filter(
      (f) =>
        f.label.toLowerCase().includes(q) ||
        f.fieldname.toLowerCase().includes(q) ||
        f.fieldtype.toLowerCase().includes(q)
    );
  }, [fields, search]);

  const groupedFields = useMemo(() => {
    const groups: Record<string, FormBuilderField[]> = {};
    for (const field of filteredFields) {
      const group = field.fieldtype;
      if (!groups[group]) groups[group] = [];
      groups[group].push(field);
    }
    return groups;
  }, [filteredFields]);

  return (
    <Card className="p-3">
      <div className="mb-3">
        <Input
          placeholder="Search fields..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-8 text-xs"
        />
      </div>
      <div className="max-h-[500px] space-y-3 overflow-y-auto">
        {Object.entries(groupedFields).map(([type, typeFields]) => (
          <div key={type}>
            <p className="mb-1.5 text-[10px] font-medium uppercase tracking-wider text-zinc-400">{type}</p>
            <div className="space-y-1.5">
              {typeFields.map((field) => (
                <DraggableField key={field.fieldname} field={field} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
