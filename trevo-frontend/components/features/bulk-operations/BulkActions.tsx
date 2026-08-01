"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/shadcn/button";
import { BulkEditDialog } from "./BulkEditDialog";
import { BulkPrintDialog } from "./BulkPrintDialog";
import { AssignToDialog } from "./AssignToDialog";
import {
  Download,
  Printer,
  UserPlus,
  Edit3,
  Trash2,
  CheckSquare,
  XSquare,
  Clipboard,
  Loader2,
} from "lucide-react";
import type { FrappeDocument } from "@/lib/frappe/types";

interface FieldMapping {
  fieldname: string;
  label: string;
  fieldtype: string;
  options?: string;
  is_child_field?: boolean;
  child_doctype?: string;
  parent_table_field?: string;
}

interface BulkActionsProps {
  doctype: string;
  selectedDocs: FrappeDocument[];
  onActionComplete: () => void;
  isSubmittable?: boolean;
  fieldMappings?: Record<string, FieldMapping>;
  printFormats?: string[];
  letterheads?: string[];
}

export function BulkActions({
  doctype,
  selectedDocs,
  onActionComplete,
  isSubmittable = false,
  fieldMappings = {},
  printFormats = [],
  letterheads = [],
}: BulkActionsProps) {
  const [actionState, setActionState] = useState<{
    type: "edit" | "print" | "assign" | null;
    open: boolean;
  }>({ type: null, open: false });
  const [loading, setLoading] = useState<string | null>(null);

  const docnames = selectedDocs.map((d) => d.name);

  const handleBulkAction = useCallback(
    async (action: string, data?: Record<string, unknown>) => {
      setLoading(action);
      try {
        await fetch(`/api/doctype/${encodeURIComponent(doctype)}/bulk`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action, docnames, data }),
        });
        onActionComplete();
      } catch (err) {
        console.error(`Bulk ${action} failed:`, err);
      } finally {
        setLoading(null);
      }
    },
    [doctype, docnames, onActionComplete],
  );

  const handleBulkDelete = useCallback(async () => {
    if (!confirm(`Delete ${selectedDocs.length} records permanently?`)) return;
    await handleBulkAction("delete");
  }, [selectedDocs.length, handleBulkAction]);

  const handleBulkSubmit = useCallback(async () => {
    if (!confirm(`Submit ${selectedDocs.length} documents?`)) return;
    await handleBulkAction("submit");
  }, [selectedDocs.length, handleBulkAction]);

  const handleBulkCancel = useCallback(async () => {
    if (!confirm(`Cancel ${selectedDocs.length} documents?`)) return;
    await handleBulkAction("cancel");
  }, [selectedDocs.length, handleBulkAction]);

  const handleCopyToClipboard = useCallback(async () => {
    const names = docnames.join("\n");
    try {
      await navigator.clipboard.writeText(names);
    } catch {
      // Fallback
      const textarea = document.createElement("textarea");
      textarea.value = names;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  }, [docnames]);

  const handleEditUpdate = useCallback(
    async (fieldname: string, value: string) => {
      await handleBulkAction("edit", { fieldname, value });
    },
    [handleBulkAction],
  );

  const handleAssignUsers = useCallback(
    async (users: string[]) => {
      await handleBulkAction("assign", { users });
    },
    [handleBulkAction],
  );

  if (selectedDocs.length === 0) return null;

  return (
    <>
      {/* Bulk Action Toolbar */}
      <div className="flex items-center justify-between border-b border-zinc-200 bg-blue-50/50 px-4 py-2 dark:border-zinc-700 dark:bg-blue-900/10">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {selectedDocs.length} selected
        </span>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* Copy to Clipboard */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyToClipboard}
            disabled={loading !== null}
            title="Copy to clipboard"
          >
            {loading === "clipboard" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Clipboard className="h-4 w-4" />
            )}
          </Button>

          {/* Export */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleBulkAction("export")}
            disabled={loading !== null}
            title="Export selected"
          >
            {loading === "export" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </Button>

          {/* Print */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActionState({ type: "print", open: true })}
            disabled={loading !== null}
            title="Print selected"
          >
            <Printer className="h-4 w-4" />
          </Button>

          {/* Edit */}
          {Object.keys(fieldMappings).length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActionState({ type: "edit", open: true })}
              disabled={loading !== null}
              title="Bulk edit"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
          )}

          {/* Assign */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActionState({ type: "assign", open: true })}
            disabled={loading !== null}
            title="Assign to"
          >
            <UserPlus className="h-4 w-4" />
          </Button>

          {/* Submit */}
          {isSubmittable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBulkSubmit}
              disabled={loading !== null}
              className="text-green-600 hover:text-green-700"
              title="Submit"
            >
              {loading === "submit" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckSquare className="h-4 w-4" />
              )}
            </Button>
          )}

          {/* Cancel */}
          {isSubmittable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBulkCancel}
              disabled={loading !== null}
              className="text-yellow-600 hover:text-yellow-700"
              title="Cancel"
            >
              {loading === "cancel" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XSquare className="h-4 w-4" />
              )}
            </Button>
          )}

          {/* Delete */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBulkDelete}
            disabled={loading !== null}
            className="text-red-600 hover:text-red-700"
            title="Delete"
          >
            {loading === "delete" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <BulkEditDialog
        open={actionState.type === "edit" && actionState.open}
        onOpenChange={(open) => setActionState({ type: "edit", open })}
        docnames={docnames}
        fieldMappings={fieldMappings}
        onUpdate={handleEditUpdate}
      />

      <BulkPrintDialog
        open={actionState.type === "print" && actionState.open}
        onOpenChange={(open) => setActionState({ type: "print", open })}
        doctype={doctype}
        docnames={docnames}
        printFormats={printFormats}
        letterheads={letterheads}
      />

<AssignToDialog
        open={actionState.type === "assign" && actionState.open}
        onOpenChange={(open) => setActionState({ type: "assign", open })}
        docnames={docnames}
        onAssign={handleAssignUsers}
      />
    </>
  );
}

