"use client";

import { useCallback, useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { GripVertical, Pencil, Trash2, MoreHorizontal } from "lucide-react";

interface KanbanCardData {
  id: string;
  title: string;
  column: string;
  data?: Record<string, unknown>;
}

interface KanbanCardProps {
  card: KanbanCardData;
  onEdit?: (card: KanbanCardData) => void;
  onDelete?: (card: KanbanCardData) => void;
  onClick?: (card: KanbanCardData) => void;
  compact?: boolean;
}

export function KanbanCard({
  card,
  onEdit,
  onDelete,
  onClick,
  compact = false,
}: KanbanCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
  });

  const handleClick = useCallback(
    () => {
      // Ignore clicks that began as drags
      if (isDragging) return;
      onClick?.(card);
    },
    [isDragging, onClick, card],
  );

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!isDragging) onClick?.(card);
        }
      }}
      role="button"
      tabIndex={0}
      style={{
        transform: transform
          ? `translate(${transform.x}px, ${transform.y}px)`
          : undefined,
        opacity: isDragging ? 0.4 : 1,
      }}
      className={`group relative cursor-grab touch-none rounded-lg border border-zinc-200 bg-white p-3 shadow-sm transition-all hover:shadow-md active:cursor-grabbing dark:border-zinc-700 dark:bg-zinc-800 ${
        isDragging ? "z-50" : ""
      }`}
    >
      {/* Drag handle */}
      <div className="absolute left-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical className="h-3.5 w-3.5 text-zinc-400" />
      </div>

      {/* Card actions */}
      <div className="absolute right-1 top-1">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen(!menuOpen);
          }}
          className="rounded p-0.5 opacity-0 group-hover:opacity-100 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-opacity"
        >
          <MoreHorizontal className="h-3.5 w-3.5 text-zinc-400" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-6 z-50 w-36 rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(card);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-700"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(card);
                  setMenuOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      {/* Card content */}
      <div className={compact ? "text-xs" : "text-sm"}>
        <p className="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2">
          {card.title}
        </p>
        {typeof card.data?.modified === 'string' && (
          <p className="mt-1 text-xs text-zinc-400">
            {new Date(card.data.modified).toLocaleDateString()}
          </p>
        )}
        {typeof card.data?.docstatus === 'number' && (
          <div className="mt-1.5">
            <span
              className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${
                card.data.docstatus === 1
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : card.data.docstatus === 2
                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400"
              }`}
            >
              {card.data.docstatus === 1
                ? "Submitted"
                : card.data.docstatus === 2
                  ? "Cancelled"
                  : "Draft"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export type { KanbanCardData };
