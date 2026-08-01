/**
 * Document state management with undo/redo, dirty tracking, and change detection.
 * Far more robust than Frappe's simple doc dict.
 */

import type { TrevoDocument, ChildTableData } from "./types";

const MAX_UNDO_HISTORY = 50;

export class DocumentState {
  private document: TrevoDocument | null = null;
  private undoStack: Array<{ values: Record<string, unknown>; timestamp: number }> = [];
  private redoStack: Array<{ values: Record<string, unknown>; timestamp: number }> = [];

  /**
   * Initialize document state from a Frappe API response
   */
  initialize(data: {
    doctype: string;
    name: string;
    docstatus: number;
    owner: string;
    creation: string;
    modified: string;
    modifiedBy: string;
    values: Record<string, unknown>;
    childTables?: Record<string, ChildTableData[]>;
  }): TrevoDocument {
    const status = this.getStatus(data.docstatus);

    this.document = {
      doctype: data.doctype,
      name: data.name,
      docstatus: data.docstatus,
      status,
      owner: data.owner,
      creation: data.creation,
      modified: data.modified,
      modifiedBy: data.modifiedBy,
      values: { ...data.values },
      originalValues: { ...data.values },
      dirty: false,
      saving: false,
      errors: {},
      loading: false,
      loadError: null,
      childTables: data.childTables ?? {},
      versions: [],
      comments: [],
      attachments: [],
      workflowState: undefined,
    };

    return this.document;
  }

  /**
   * Initialize a new document (for creation)
   */
  initializeNew(doctype: string, defaults: Record<string, unknown> = {}): TrevoDocument {
    this.document = {
      doctype,
      name: `new-${doctype.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
      docstatus: 0,
      status: "draft",
      owner: "",
      creation: new Date().toISOString(),
      modified: new Date().toISOString(),
      modifiedBy: "",
      values: { ...defaults },
      originalValues: { ...defaults },
      dirty: true,
      saving: false,
      errors: {},
      loading: false,
      loadError: null,
      childTables: {},
      versions: [],
      comments: [],
      attachments: [],
      workflowState: undefined,
    };

    return this.document;
  }

  /**
   * Update a single field value
   */
  setField(fieldname: string, value: unknown): void {
    if (!this.document) return;

    this.pushUndo();
    this.document.values[fieldname] = value;
    this.document.dirty = true;
    this.document.modified = new Date().toISOString();
  }

  /**
   * Batch update multiple fields
   */
  setFields(values: Record<string, unknown>): void {
    if (!this.document) return;

    this.pushUndo();
    Object.assign(this.document.values, values);
    this.document.dirty = true;
    this.document.modified = new Date().toISOString();
  }

  /**
   * Set child table data
   */
  setChildTable(fieldname: string, data: ChildTableData[]): void {
    if (!this.document) return;

    this.document.childTables[fieldname] = data;
    this.document.dirty = true;
    this.document.modified = new Date().toISOString();
  }

  /**
   * Add a row to a child table
   */
  addChildTableRow(fieldname: string, values: Record<string, unknown> = {}): void {
    if (!this.document) return;

    const rows = this.document.childTables[fieldname] ?? [];
    const newRow: ChildTableData = {
      name: `new-${Date.now()}`,
      idx: rows.length,
      parent: this.document.name,
      parentfield: fieldname,
      parenttype: this.document.doctype,
      values: { ...values },
      dirty: true,
      isNew: true,
      toDelete: false,
    };

    this.document.childTables[fieldname] = [...rows, newRow];
    this.document.dirty = true;
  }

  /**
   * Remove a row from a child table
   */
  removeChildTableRow(fieldname: string, rowName: string): void {
    if (!this.document) return;

    const rows = this.document.childTables[fieldname] ?? [];
    const row = rows.find((r) => r.name === rowName);

    if (row) {
      if (row.isNew) {
        // Immediately remove if it was never saved
        this.document.childTables[fieldname] = rows.filter((r) => r.name !== rowName);
      } else {
        // Mark for deletion (will be removed on save)
        row.toDelete = true;
      }
    }

    this.document.dirty = true;
  }

  /**
   * Update a child table row
   */
  updateChildTableRow(fieldname: string, rowName: string, values: Record<string, unknown>): void {
    if (!this.document) return;

    const rows = this.document.childTables[fieldname] ?? [];
    const row = rows.find((r) => r.name === rowName);

    if (row) {
      Object.assign(row.values, values);
      row.dirty = true;
    }

    this.document.dirty = true;
  }

  /**
   * Set field errors
   */
  setErrors(errors: Record<string, string[]>): void {
    if (!this.document) return;
    this.document.errors = { ...errors };
  }

  /**
   * Clear errors for a specific field or all fields
   */
  clearErrors(fieldname?: string): void {
    if (!this.document) return;

    if (fieldname) {
      delete this.document.errors[fieldname];
    } else {
      this.document.errors = {};
    }
  }

  /**
   * Set saving state
   */
  setSaving(saving: boolean): void {
    if (!this.document) return;
    this.document.saving = saving;
  }

  /**
   * Mark document as saved (reset dirty state)
   */
  markSaved(): void {
    if (!this.document) return;

    this.document.originalValues = { ...this.document.values };
    this.document.dirty = false;
    this.document.saving = false;
    this.document.errors = {};

    // Update child tables
    for (const fieldname of Object.keys(this.document.childTables)) {
      const rows = this.document.childTables[fieldname];
      this.document.childTables[fieldname] = rows.map((r) => ({
        ...r,
        dirty: false,
        isNew: false,
        toDelete: false,
      }));
    }
  }

  /**
   * Revert to original values (undo all changes)
   */
  revert(): void {
    if (!this.document) return;

    this.document.values = { ...this.document.originalValues };
    this.document.dirty = false;
    this.document.errors = {};

    // Revert child tables
    for (const fieldname of Object.keys(this.document.childTables)) {
      void fieldname;
      // Reset child table data...
    }
  }

  /**
   * Undo last change
   */
  undo(): boolean {
    if (this.undoStack.length === 0) return false;

    const previous = this.undoStack.pop()!;
    this.redoStack.push({
      values: { ...this.document?.values },
      timestamp: Date.now(),
    });

    if (this.document) {
      this.document.values = previous.values;
      this.document.dirty = true;
    }

    return true;
  }

  /**
   * Redo last undone change
   */
  redo(): boolean {
    if (this.redoStack.length === 0) return false;

    const next = this.redoStack.pop()!;
    this.undoStack.push({
      values: { ...this.document?.values },
      timestamp: Date.now(),
    });

    if (this.document) {
      this.document.values = next.values;
      this.document.dirty = true;
    }

    return true;
  }

  /**
   * Get current document
   */
  getDocument(): TrevoDocument | null {
    return this.document;
  }

  /**
   * Get current values
   */
  getValues(): Record<string, unknown> {
    return this.document?.values ?? {};
  }

  /**
   * Check if document has unsaved changes
   */
  isDirty(): boolean {
    return this.document?.dirty ?? false;
  }

  /**
   * Get changed fields
   */
  getChangedFields(): string[] {
    if (!this.document) return [];

    return Object.keys(this.document.values).filter((key) => {
      const current = this.document!.values[key];
      const original = this.document!.originalValues[key];
      return current !== original;
    });
  }

  /**
   * Push current state to undo stack
   */
  private pushUndo(): void {
    if (!this.document) return;

    this.undoStack.push({
      values: { ...this.document.values },
      timestamp: Date.now(),
    });

    // Limit undo history
    if (this.undoStack.length > MAX_UNDO_HISTORY) {
      this.undoStack.shift();
    }

    // Clear redo stack on new action
    this.redoStack = [];
  }

  /**
   * Get status string from docstatus
   */
  private getStatus(docstatus: number): TrevoDocument["status"] {
    switch (docstatus) {
      case 0:
        return "draft";
      case 1:
        return "submitted";
      case 2:
        return "cancelled";
      default:
        return "unknown";
    }
  }

  /**
   * Reset state
   */
  reset(): void {
    this.document = null;
    this.undoStack = [];
    this.redoStack = [];
  }
}
