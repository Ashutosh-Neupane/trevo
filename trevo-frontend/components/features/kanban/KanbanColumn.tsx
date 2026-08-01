"use client";

import { useCallback } from "react";
import { useDroppable } from "@dnd-kit/core";
import { Plus, Archive } from "lucide-react";
import { KanbanCard } from "./KanbanCard";
import type { KanbanCardData } from "./KanbanCard";

interface KanbanColumnProps {
  id: string;
  title: string;
  cards: KanbanCardData[];
  color?: string;
  onAddCard?: (columnId: string) => void;
  onEditCard?: (card: KanbanCardData) => void;
  onDeleteCard?: (card: KanbanCardData) => void;
  onCardClick?: (card: KanbanCardData) => void;
  onArchiveColumn?: (columnId: string) => void;
  onDrop?: (e: React.DragEvent, columnId: string) => void;
}

export function KanbanColumn({
  id,
  title,
  cards,
  color = "zinc",
  onAddCard,
  onEditCard,
  onDeleteCard,
  onCardClick,
  onArchiveColumn,
  onDrop,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      onDrop?.(e, id);
    },
    [id, onDrop],
  );

  const colorMap: Record<string, string> = {
    blue: "border-blue-500 bg-blue-50 dark:bg-blue-950/20",
    green: "border-green-500 bg-green-50 dark:bg-green-950/20",
    purple: "border-purple-500 bg-purple-50 dark:bg-purple-950/20",
    yellow: "border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20",
    red: "border-red-500 bg-red-50 dark:bg-red-950/20",
    zinc: "border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/50",
  };

  const headerColorMap: Record<string, string> = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    purple: "bg-purple-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
    zinc: "bg-zinc-400 dark:bg-zinc-500",
  };

  return (
    <div
      ref={setNodeRef}
      onDrop={handleDrop}
      className={`flex w-72 shrink-0 flex-col rounded-xl border-2 transition-colors ${
        colorMap[color] ?? colorMap.zinc
      } ${isOver ? "border-blue-400 bg-blue-50 dark:bg-blue-950/30" : ""}`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-full ${headerColorMap[color] ?? headerColorMap.zinc}`} />
          <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
            {title}
          </h3>
          <span className="rounded-full bg-zinc-200 px-1.5 py-0.5 text-[10px] font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-400">
            {cards.length}
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          {onAddCard && (
            <button
              onClick={() => onAddCard(id)}
              className="rounded p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              title="Add card"
            >
              <Plus className="h-3.5 w-3.5 text-zinc-500" />
            </button>
          )}
          {onArchiveColumn && (
            <button
              onClick={() => onArchiveColumn(id)}
              className="rounded p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              title="Archive column"
            >
              <Archive className="h-3.5 w-3.5 text-zinc-500" />
            </button>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-2">
        {cards.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-xs text-zinc-400">No cards</p>
          </div>
        ) : (
          cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              onEdit={onEditCard}
              onDelete={onDeleteCard}
              onClick={onCardClick}
            />
          ))
        )}
      </div>

      {/* Add card button at bottom */}
      {onAddCard && (
        <button
          onClick={() => onAddCard(id)}
          className="flex items-center justify-center gap-1 border-t border-zinc-200 px-3 py-2 text-xs text-zinc-500 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800 rounded-b-lg transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Card
        </button>
      )}
    </div>
  );
}
