"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import type { DocTypeMeta, DocField, FrappeDocument } from "@/lib/frappe/types";
import type { TrevoDocument } from "../types";
import { parseDoctypeMeta } from "../meta/parseDoctypeMeta";
import FormControl from "../controls/FormControl";
import TableField from "../controls/TableField";
import { useTrevoFormStore } from "../FormStore";
import { validateFields } from "../validation";

interface FormRendererProps {
  meta: DocTypeMeta | null | undefined;
  doc?: TrevoDocument | FrappeDocument | null;
  editable?: boolean;
  readOnly?: boolean;
  onChange?: (values: Record<string, unknown>) => void;
  onSave?: (values: Record<string, unknown>) => Promise<void>;
  onSubmit?: (values: Record<string, unknown>) => Promise<void>;
  onCancel?: () => void;
  onDiscard?: () => void;
  className?: string;
}

export default function FormRenderer({
  meta,
  doc,
  editable = true,
  readOnly = false,
  onChange,
  onSave,
  onSubmit,
  onCancel,
  onDiscard,
  className = "",
}: FormRendererProps) {
  const store = useTrevoFormStore();
  const { fields, sections } = useMemo(() => {
    if (!meta) return { fields: [], sections: [] };
    return parseDoctypeMeta(meta);
  }, [meta]);

  const isReadOnly = Boolean(readOnly || (doc && typeof doc === "object" && "docstatus" in doc && doc.docstatus !== 0 && doc.docstatus !== undefined));

  const formValues = useMemo(() => {
    if (!doc) {
      return fields.reduce<Record<string, unknown>>((acc, f) => ({ ...acc, [f.fieldname]: f.default ?? "" }), {});
    }
    if ("values" in doc && doc.values) {
      return doc.values as Record<string, unknown>;
    }
    const raw = doc as FrappeDocument;
    const vals: Record<string, unknown> = {};
    for (const key of Object.keys(raw)) {
      if (!["name", "doctype", "owner", "creation", "modified", "modified_by", "parent", "parenttype", "parentfield", "idx", "docstatus", "__islocal", "__unsaved"].includes(key)) {
        vals[key] = raw[key];
      }
    }
    return vals;
  }, [doc, fields]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lastSavedValues, setLastSavedValues] = useState<string>("");
  const [localValues, setLocalValues] = useState<Record<string, unknown>>(formValues);
  const historyRef = useRef<Array<Record<string, unknown>>>([]);

  useEffect(() => {
    /* eslint-disable-next-line react-hooks/set-state-in-effect */
    setLocalValues(formValues);
    historyRef.current = [];
  }, [doc, formValues]);

  const isDirty = useMemo(() => {
    const current = JSON.stringify(localValues);
    return current !== lastSavedValues;
  }, [localValues, lastSavedValues]);

  const handleFieldChange = (fieldname: string, value: unknown) => {
    historyRef.current = [...historyRef.current, localValues];
    if (historyRef.current.length > 50) {
      historyRef.current.shift();
    }
    const next = { ...localValues, [fieldname]: value };
    setLocalValues(next);
    onChange?.(next);
    store.setField(fieldname, value);
    setErrors((prev) => {
      const next = { ...prev };
      delete next[fieldname];
      return next;
    });
  };

  const handleUndo = useCallback(() => {
    if (historyRef.current.length === 0) return;
    const previous = historyRef.current[historyRef.current.length - 1];
    historyRef.current = historyRef.current.slice(0, -1);
    setLocalValues(previous);
    onChange?.(previous);
  }, [onChange]);

  const runValidation = useCallback(() => {
    const validationErrors = validateFields(fields, localValues);
    const mapped = Object.fromEntries(validationErrors.map((e) => [e.fieldname, e.message])) as Record<string, string>;
    setErrors(mapped);
    return validationErrors.length === 0;
  }, [fields, localValues]);

  const handleSave = useCallback(async () => {
    if (!runValidation()) return;
    const next = { ...localValues };
    await onSave?.(next);
    setLastSavedValues(JSON.stringify(next));
  }, [runValidation, onSave, localValues]);

  const handleSubmit = useCallback(async () => {
    if (!runValidation()) return;
    const next = { ...localValues };
    await onSubmit?.(next);
    setLastSavedValues(JSON.stringify(next));
  }, [runValidation, onSubmit, localValues]);

  useEffect(() => {
    if (!editable || isReadOnly) return;

    const handler = (e: KeyboardEvent) => {
      const isInput = ["INPUT", "TEXTAREA", "SELECT"].includes((window.document.activeElement as HTMLElement | null)?.tagName ?? "");

      if ((e.metaKey || e.ctrlKey) && e.key === "s" && !isInput && onSave) {
        e.preventDefault();
        if (runValidation()) {
          void handleSave();
        }
      }

      if ((e.metaKey || e.ctrlKey) && e.key === "z" && !isInput) {
        e.preventDefault();
        handleUndo();
      }
    };

    window.document.addEventListener("keydown", handler);
    return () => window.document.removeEventListener("keydown", handler);
  }, [editable, isReadOnly, onSave, runValidation, handleSave, handleUndo]);

  useEffect(() => {
    if (!onSave || !editable || isReadOnly || !isDirty) return;

    const interval = setInterval(() => {
      if (runValidation()) {
        void handleSave();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [onSave, editable, isReadOnly, isDirty, runValidation, handleSave]);

  const renderSection = (section: typeof sections[0]) => {
    const isCollapsed = store.collapsedSections.has(section.fieldname);
    const visibleFields = section.fields.filter((f) => !f.hidden);

    return (
      <div
        key={section.fieldname}
        className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden transition-all duration-200"
      >
        <button
          type="button"
          onClick={() => store.toggleSection(section.fieldname)}
          className="flex w-full items-center justify-between px-4 py-3 text-left bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {section.label}
          </h3>
          <svg
            className={`h-4 w-4 text-zinc-500 transition-transform duration-200 ${isCollapsed ? "-rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {!isCollapsed && (
          <div className="p-4">
            <div
              className={`grid gap-4 ${
                section.columns === 2 ? "grid-cols-1 md:grid-cols-2" : section.columns === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1"
              }`}
            >
              {visibleFields.map((field) => (
                <FormControl
                  key={field.fieldname}
                  field={field as DocField}
                  value={localValues[field.fieldname]}
                  onChange={(val) => handleFieldChange(field.fieldname, val)}
                  disabled={!editable || isReadOnly}
                  error={errors[field.fieldname]}
                />
              ))}

              {section.childTables.map((tableField) => (
                <div key={tableField.fieldname} className="col-span-full">
                  <h4 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {tableField.label || tableField.fieldname}
                  </h4>
                  <TableField
                    field={tableField as DocField}
                    value={localValues[tableField.fieldname]}
                    onChange={(val) => handleFieldChange(tableField.fieldname, val)}
                    disabled={!editable || isReadOnly}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (!meta) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-sm text-zinc-500">Loading form...</div>
      </div>
    );
  }

  return (
    <div className={["space-y-4", className].join(" ")}>
      {(onSave || onSubmit || onCancel || onDiscard) && editable && !isReadOnly && (
        <div className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-zinc-600 dark:text-zinc-400">Auto-save enabled</span>
          </div>
          <div className="flex gap-2">
              {onSave && (
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
                >
                  Save
                </button>
              )}
              {onSubmit && (
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                >
                  Submit
                </button>
              )}
            {onDiscard && (
              <button
                type="button"
                onClick={onDiscard}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700 transition-colors"
              >
                Discard
              </button>
            )}
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 dark:border-zinc-600 dark:text-red-400 dark:hover:bg-zinc-700 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      )}

      {sections.length > 0 ? (
        <div className="space-y-4">
          {sections.map((section) => renderSection(section))}
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
          {fields.map((field) => (
            <FormControl
              key={field.fieldname}
              field={field as DocField}
              value={localValues[field.fieldname]}
              onChange={(val) => handleFieldChange(field.fieldname, val)}
              disabled={!editable || isReadOnly}
              error={errors[field.fieldname]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
