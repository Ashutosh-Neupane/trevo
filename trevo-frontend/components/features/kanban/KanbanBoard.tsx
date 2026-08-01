"use client";

import { useState, useCallback, useMemo } from "react";
import { Plus, Settings } from "lucide-react";
import { KanbanColumn } from "./KanbanColumn";
import type { KanbanCardData } from "./KanbanCard";
import { Button } from "@/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/shadcn/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";

interface KanbanColumnData {
  id: string;
  title: string;
  order: number;
  status: string;
  color?: string;
}

interface KanbanBoardData {
  name?: string;
  field_name: string;
  column_field: string;
}

interface KanbanBoardProps {
  doctype: string;
  defaultColumns?: KanbanColumnData[];
  defaultCards?: KanbanCardData[];
  boardData?: KanbanBoardData;
}

const DEFAULT_COLORS = ["blue", "green", "purple", "yellow", "red", "zinc"];

export function KanbanBoard({
  doctype,
  defaultColumns = [],
  defaultCards = [],
  boardData,
}: KanbanBoardProps) {
  const [columns, setColumns] = useState<KanbanColumnData[]>(defaultColumns);
  const [cards, setCards] = useState<KanbanCardData[]>(defaultCards);
  const [newCardDialog, setNewCardDialog] = useState<{ open: boolean; columnId: string }>({
    open: false,
    columnId: "",
  });
  const [newCardTitle, setNewCardTitle] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [draggedCard, setDraggedCard] = useState<KanbanCardData | null>(null);

  // Fetch kanban data
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["kanban", doctype],
    queryFn: async () => {
      const res = await fetch(`/api/doctype/${encodeURIComponent(doctype)}/kanban`);
      if (!res.ok) throw new Error("Failed to fetch kanban data");
      return res.json() as Promise<{
        board: KanbanBoardData;
        columns: KanbanColumnData[];
        cards: KanbanCardData[];
      }>;
    },
  });

  // Compute derived state from data
  const effectiveColumns = useMemo(
    () => (data?.columns && data.columns.length > 0 ? data.columns : columns),
    [data?.columns, columns],
  );
  const effectiveCards = useMemo(
    () => (data?.cards && data.cards.length > 0 ? data.cards : cards),
    [data?.cards, cards],
  );

  // Move card mutation
  const moveMutation = useMutation({
    mutationFn: async (params: { cardId: string; column: string }) => {
      const res = await fetch(`/api/doctype/${encodeURIComponent(doctype)}/kanban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "move_card",
          card_id: params.cardId,
          column: params.column,
          data: { column_field: boardData?.column_field ?? "status" },
        }),
      });
      if (!res.ok) throw new Error("Failed to move card");
      return res.json();
    },
  });

  // Create card mutation
  const createMutation = useMutation({
    mutationFn: async (params: { title: string; column: string }) => {
      const res = await fetch(`/api/doctype/${encodeURIComponent(doctype)}/kanban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_card",
          column: params.column,
          data: {
            [boardData?.field_name ?? "subject"]: params.title,
            column_field: boardData?.column_field ?? "status",
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to create card");
      return res.json();
    },
    onSuccess: () => {
      refetch();
    },
  });

const handleDragStart = useCallback(
    (_e: React.DragEvent, _card: KanbanCardData) => {
      setDraggedCard(_card);
    },
    [],
  );

  const handleDragEnd = useCallback(() => {
    setDraggedCard(null);
  }, []);

  const handleDrop = useCallback(
    async (_e: React.DragEvent, columnId: string) => {
      if (!draggedCard) return;

      // Optimistic update
      setCards((prev) =>
        prev.map((c) => (c.id === draggedCard.id ? { ...c, column: columnId } : c)),
      );

      // Server update
      await moveMutation.mutateAsync({
        cardId: draggedCard.id,
        column: columnId,
      });
    },
    [draggedCard, moveMutation],
  );

  const handleAddCard = useCallback(
    async (columnId: string) => {
      if (!newCardTitle.trim()) return;
      await createMutation.mutateAsync({
        title: newCardTitle.trim(),
        column: columnId,
      });
      setNewCardTitle("");
      setNewCardDialog({ open: false, columnId: "" });
    },
    [newCardTitle, createMutation],
  );

  const handleEditCard = useCallback((card: KanbanCardData) => {
    // Navigate to the form view for this document
    window.location.href = `/desk/doctype/${encodeURIComponent(doctype)}/${encodeURIComponent(card.id)}`;
  }, [doctype]);

  const handleDeleteCard = useCallback(async (card: KanbanCardData) => {
    if (!confirm(`Delete "${card.title}"?`)) return;
    try {
      await fetch(`/api/doctype/${encodeURIComponent(doctype)}/${encodeURIComponent(card.id)}/doc`, {
        method: "DELETE",
      });
      setCards((prev) => prev.filter((c) => c.id !== card.id));
    } catch {
      // Error handled by parent
    }
  }, [doctype]);

  const handleCardClick = useCallback(
    (card: KanbanCardData) => {
      window.location.href = `/desk/doctype/${encodeURIComponent(doctype)}/${encodeURIComponent(card.id)}`;
    },
    [doctype],
  );

  const handleArchiveColumn = useCallback((columnId: string) => {
    setColumns((prev) =>
      prev.map((c) => (c.id === columnId ? { ...c, status: "archived" } : c)),
    );
  }, []);

  const activeColumns = effectiveColumns.filter((c) => c.status !== "archived");

  if (isLoading && defaultColumns.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Kanban Board
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSettingsOpen(true)}
          >
            <Settings className="mr-1 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Kanban columns */}
      {activeColumns.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700">
          <div className="text-center">
            <p className="text-sm text-zinc-500">No columns configured</p>
            <p className="text-xs text-zinc-400">Set up your kanban board in settings</p>
          </div>
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {activeColumns.map((col, index) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              cards={effectiveCards.filter((c) => c.column === col.id)}
              color={col.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
              onAddCard={(columnId) =>
                setNewCardDialog({ open: true, columnId })
              }
              onEditCard={handleEditCard}
              onDeleteCard={handleDeleteCard}
              onCardClick={handleCardClick}
              onArchiveColumn={handleArchiveColumn}
              onDrop={handleDrop}
            />
          ))}

          {/* Add column placeholder */}
          <div className="flex w-72 shrink-0 items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700">
            <button
              onClick={() => setSettingsOpen(true)}
              className="flex flex-col items-center gap-2 text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              <Plus className="h-6 w-6" />
              <span className="text-sm">Add Column</span>
            </button>
          </div>
        </div>
      )}

      {/* Add card dialog */}
      <Dialog
        open={newCardDialog.open}
        onOpenChange={(open) => setNewCardDialog({ open, columnId: "" })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Card</DialogTitle>
          </DialogHeader>
          <input
            type="text"
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            placeholder="Card title..."
            className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddCard(newCardDialog.columnId);
            }}
            autoFocus
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewCardDialog({ open: false, columnId: "" })}
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleAddCard(newCardDialog.columnId)}
              disabled={!newCardTitle.trim()}
            >
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Kanban Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Columns
              </label>
              <div className="space-y-2">
                {columns.map((col) => (
                  <div
                    key={col.id}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-700"
                  >
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">
                      {col.title}
                    </span>
                    <span className="text-xs text-zinc-400">
                      {col.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs text-zinc-500">
              Column management is handled through the Frappe Kanban Board doctype.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={() => setSettingsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export type { KanbanColumnData, KanbanBoardData };
