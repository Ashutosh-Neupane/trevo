"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/shadcn/dialog";

interface FieldMapping {
  fieldname: string;
  label: string;
  fieldtype: string;
  options?: string;
  is_child_field?: boolean;
  child_doctype?: string;
  parent_table_field?: string;
}

interface BulkEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  docnames: string[];
  fieldMappings: Record<string, FieldMapping>;
  onUpdate: (fieldname: string, value: string) => Promise<void>;
}

export function BulkEditDialog({
  open,
  onOpenChange,
  docnames,
  fieldMappings,
  onUpdate,
}: BulkEditDialogProps) {
  const [selectedField, setSelectedField] = useState<string>("");
  const [fieldValue, setFieldValue] = useState<string>("");
  const [updating, setUpdating] = useState(false);

  const fieldOptions = useMemo(
    () =>
      Object.keys(fieldMappings).sort((a, b) =>
        (fieldMappings[a]?.label ?? a).localeCompare(fieldMappings[b]?.label ?? b),
      ),
    [fieldMappings],
  );

  const currentMapping = selectedField ? fieldMappings[selectedField] : null;

  const handleUpdate = async () => {
    if (!selectedField) return;
    setUpdating(true);
    try {
      await onUpdate(selectedField, fieldValue);
      onOpenChange(false);
    } catch {
      // Error handled by parent
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Bulk Edit — {docnames.length} {docnames.length === 1 ? "record" : "records"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Field selector */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Field
            </label>
            <select
              value={selectedField}
              onChange={(e) => {
                setSelectedField(e.target.value);
                setFieldValue("");
              }}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value="">Select a field...</option>
              {fieldOptions.map((key) => (
                <option key={key} value={key}>
                  {fieldMappings[key]?.label ?? key}
                </option>
              ))}
            </select>
          </div>

          {/* Value input */}
          {currentMapping && (
            <div>
              <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Value
              </label>
              {currentMapping.fieldtype === "Select" && currentMapping.options ? (
                <select
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  <option value="">Select value...</option>
                  {currentMapping.options.split("\n").map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : currentMapping.fieldtype === "Check" ? (
                <input
                  type="checkbox"
                  checked={fieldValue === "1"}
                  onChange={(e) => setFieldValue(e.target.checked ? "1" : "0")}
                  className="rounded border-zinc-300"
                />
              ) : currentMapping.fieldtype === "Date" ? (
                <input
                  type="date"
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              ) : currentMapping.fieldtype === "Int" || currentMapping.fieldtype === "Float" || currentMapping.fieldtype === "Currency" ? (
                <input
                  type="number"
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              ) : (
                <input
                  type="text"
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                  placeholder={`Enter value for ${currentMapping.label}`}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
                />
              )}
              {currentMapping.is_child_field && (
                <p className="mt-1 text-xs text-zinc-500">
                  This will update all rows in {currentMapping.child_doctype} child table
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={updating}>
            Cancel
          </Button>
          <Button onClick={handleUpdate} disabled={!selectedField || updating}>
            {updating ? "Updating..." : `Update ${docnames.length} records`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

