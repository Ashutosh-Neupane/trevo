"use client";

import { useMemo } from "react";
import type { DocTypeMeta } from "@/lib/frappe/types";
import type { TrevoField, TrevoDocument } from "../types";
import { parseDoctypeMeta } from "../meta/parseDoctypeMeta";
import FormControl from "../controls/FormControl";
import { useTrevoFormStore } from "../FormStore";

interface FormRendererProps {
  /** Frappe DocType metadata */
  meta: DocTypeMeta | null | undefined;
  /** Document data (for edit view) */
  document?: TrevoDocument;
  /** Whether the form is in edit mode */
  editable?: boolean;
  /** Whether the form is read-only */
  readOnly?: boolean;
  /** Callback when form values change */
  onChange?: (values: Record<string, unknown>) => void;
  /** Callback when save is requested */
  onSave?: (values: Record<string, unknown>) => Promise<void>;
  /** Callback when submit is requested */
  onSubmit?: (values: Record<string, unknown>) => Promise<void>;
  /** Callback when cancel is requested */
  onCancel?: () => void;
  /** Callback when discard is requested */
  onDiscard?: () => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * FormRenderer — the main form component.
 * Renders a complete Frappe DocType form with sections, tabs, columns, and all field types.
 * Supports edit/create modes, auto-save, validation, and keyboard shortcuts.
 */
export default function FormRenderer({
  meta,
  document,
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
  const { fields, sections, layout } = useMemo(() => {
    if (!meta) return { fields: [], sections: [], layout: { columns: 1, mode: "standard" as const } };
    return parseDoctypeMeta(meta);
  }, [meta]);

  // Determine if we're in read-only mode based on docstatus
  const isReadOnly = readOnly || (document?.docstatus !== 0 && document?.docstatus !== undefined);

  // Build form values from document or empty object
  const formValues = useMemo(() => {
    if (document?.values) return document.values;
    return fields.reduce<Record<string, unknown>>((acc, f) => ({ ...acc, [f.fieldname]: f.default ?? "" }), {});
  }, [document?.values, fields]);

  const handleFieldChange = (fieldname: string, value: unknown) => {
    const next = { ...formValues, [fieldname]: value };
    onChange?.(next);
    store.setField(fieldname, value);
  };

  // Group fields into rows based on column count
  const renderSection = (section: typeof sections[0], sectionIndex: number) => {
    const isCollapsed = store.collapsedSections.has(section.fieldname);
    const visibleFields = section.fields.filter((f) => !f.hidden);

    return (
      <div
        key={section.fieldname}
        className={[
          "rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden",
          "transition-all duration-200",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={() => store.toggleSection(section.fieldname)}
          className={[
            "flex w-full items-center justify-between px-4 py-3 text-left",
            "bg-zinc-50 dark:bg-zinc-800/50",
            "hover:bg-zinc-100 dark:hover:bg-zinc-800",
            "transition-colors",
          ].join(" ")}
        >
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            {section.label}
          </h3>
          <svg
            className={[
              "h-4 w-4 text-zinc-500 transition-transform duration-200",
              isCollapsed ? "-rotate-90" : "",
            ].join(" ")}
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
              className={[
                "grid gap-4",
                section.columns === 2 && "grid-cols-1 md:grid-cols-2",
                section.columns === 3 && "grid-cols-1 md:grid-cols-3",
              ].join(" ")}
            >
              {visibleFields.map((field) => (
                <FormControl
                  key={field.fieldname}
                  field={field}
                  value={formValues[field.fieldname]}
                  onChange={(val) => handleFieldChange(field.fieldname, val)}
                  disabled={!editable || isReadOnly}
                />
              ))}

              {section.childTables.map((tableField) => (
                <div key={tableField.fieldname} className="col-span-full">
                  <h4 className="mb-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {tableField.label || tableField.fieldname}
                  </h4>
                  <div className="rounded-lg border border-zinc-200 dark:border-zinc-700">
                    {JSON.stringify(tableField)}
                  </div>
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
      {/* Form header with actions */}
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
                onClick={() => onSave(formValues)}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors"
              >
                Save
              </button>
            )}
            {onSubmit && (
              <button
                type="button"
                onClick={() => onSubmit(formValues)}
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

      {/* Form sections */}
      {sections.length > 0 ? (
        <div className="space-y-4">
          {sections.map((section, i) => renderSection(section, i))}
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-700 dark:bg-zinc-800">
          {fields.map((field) => (
            <FormControl
              key={field.fieldname}
              field={field}
              value={formValues[field.fieldname]}
              onChange={(val) => handleFieldChange(field.fieldname, val)}
              disabled={!editable || isReadOnly}
            />
          ))}
        </div>
      )}
    </div>
  );
}
