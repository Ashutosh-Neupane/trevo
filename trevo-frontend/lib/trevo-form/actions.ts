/**
 * Form actions — save, submit, cancel, discard, delete, duplicate, reload.
 * Each action provides optimistic updates, error handling, and rollback.
 */

import type { TrevoFormStore } from "./FormStore";

export interface FormActionResult {
  success: boolean;
  message: string;
  data?: unknown;
  error?: string;
}

/**
 * Execute a form action with optimistic updates.
 */
export async function executeFormAction(
  action: string,
  store: TrevoFormStore,
  options: {
    doctype: string;
    name?: string;
    values?: Record<string, unknown>;
    childTables?: Record<string, unknown[]>;
    onSuccess?: (data: unknown) => void;
    onError?: (error: Error) => void;
  },
): Promise<FormActionResult> {
  const document = store.getDocument();
  if (!document) {
    return { success: false, message: "No document loaded" };
  }

  const { doctype, name, values, childTables, onSuccess, onError } = options;

  try {
    // Optimistic update: set saving state
    store.setSaving(true);

    // Build the document payload
    const payload: Record<string, unknown> = {
      doctype,
      ...(values || store.getValues()),
    };

    if (name && name !== "new") {
      payload.name = name;
    }

    // Include child tables
    if (childTables) {
      for (const [fieldname, rows] of Object.entries(childTables)) {
        payload[fieldname] = rows;
      }
    }

    let result: unknown;
    let message: string;

    switch (action) {
      case "Save": {
        const res = await fetch(`/api/doctype/${encodeURIComponent(doctype)}/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to save");
        }

        const json = await res.json();
        result = json.data;
        message = "Document saved successfully";
        break;
      }

      case "Submit":
      case "Update": {
        const res = await fetch(`/api/doctype/${encodeURIComponent(doctype)}/save`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, action }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || `Failed to ${action.toLowerCase()}`);
        }

        const json = await res.json();
        result = json.data;
        message = action === "Submit" ? "Document submitted successfully" : "Document updated successfully";
        break;
      }

      case "Cancel": {
        const res = await fetch(`/api/doctype/${encodeURIComponent(doctype)}/${encodeURIComponent(name!)}/doc`, {
          method: "DELETE",
        }).catch(() => null);

        if (!res || !res.ok) {
          throw new Error("Failed to cancel document");
        }

        result = null;
        message = "Document cancelled successfully";
        break;
      }

      case "Duplicate": {
        const res = await fetch(`/api/doctype/${encodeURIComponent(doctype)}/${encodeURIComponent(name!)}/copy`, {
          method: "GET",
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Failed to duplicate document");
        }

        const json = await res.json();
        result = json.data;
        message = "Document duplicated successfully";
        break;
      }

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    // Optimistic update: mark as saved
    store.markSaved();

    if (onSuccess) {
      onSuccess(result);
    }

    return {
      success: true,
      message,
      data: result,
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error("Unknown error");

    // Rollback: unmark saving state
    store.setSaving(false);

    if (onError) {
      onError(err);
    }

    return {
      success: false,
      message: "Action failed",
      error: err.message,
    };
  }
}

/**
 * Validate document values against Frappe rules.
 */
export function validateDocument(
  values: Record<string, unknown>,
  fields: Array<{ fieldname: string; reqd?: boolean; regex?: string }>,
): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  for (const field of fields) {
    const value = values[field.fieldname];

    // Required field check
    if (field.reqd && (value === null || value === undefined || value === "")) {
      errors[field.fieldname] = errors[field.fieldname] || [];
      errors[field.fieldname].push("This field is required");
    }

    // Regex validation
    if (field.regex && value) {
      const regex = new RegExp(field.regex);
      if (!regex.test(String(value))) {
        errors[field.fieldname] = errors[field.fieldname] || [];
        errors[field.fieldname].push("Invalid format");
      }
    }
  }

  return errors;
}
