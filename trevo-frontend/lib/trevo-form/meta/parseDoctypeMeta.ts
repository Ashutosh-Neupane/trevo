/**
 * Parse Frappe DocType meta into Trevo's enhanced format.
 * Handles sections, tabs, columns, and all field types.
 */

import type { DocTypeMeta, DocField } from "@/lib/frappe/types";
import type { TrevoField, FormSection, FormLayout } from "../types";


const STRUCTURAL_TYPES = new Set([
  "Section Break", "Column Break", "Tab Break", "Heading", "Read Only", "Button", "HTML",
]);

interface ParsedMeta {
  fields: TrevoField[];
  sections: FormSection[];
  layout: FormLayout;
}

/**
 * Parse Frappe metadata into Trevo's internal format.
 * Handles sections, tabs, and column breaks automatically.
 */
export function parseDoctypeMeta(meta: DocTypeMeta): ParsedMeta {
  const rawFields = meta.fields ?? [];

  // Separate structural fields from data fields
  const structuralFields = rawFields.filter((f) => STRUCTURAL_TYPES.has(f.fieldtype));
  const dataFields = rawFields.filter((f) => !STRUCTURAL_TYPES.has(f.fieldtype));

  // Enhance data fields with Trevo-specific properties
  const enhancedFields: TrevoField[] = dataFields.map((f) => enhanceField(f));

  // Build sections from structural markers
  const sections = buildSections(rawFields, enhancedFields);

  // Determine layout based on column breaks
  const layout = determineLayout(structuralFields);

  return {
    fields: enhancedFields,
    sections,
    layout,
  };
}

function enhanceField(f: DocField): TrevoField {
  return {
    fieldname: f.fieldname,
    label: f.label ?? f.fieldname,
    fieldtype: f.fieldtype,
    required: !!f.reqd,
    readOnly: !!f.read_only,
    hidden: !!f.hidden,
    collapsed: !!f.collapsed,
    description: f.description ?? undefined,
    placeholder: (typeof f.placeholder === "string" ? f.placeholder : undefined),

    options: f.options ?? null,
    default: f.default ?? null,
    length: typeof f.length === "number" ? f.length : undefined,
    precision: typeof f.precision === "number" ? f.precision : undefined,

    inListView: !!f.in_list_view,
    allowInQuickEntry: !!f.allow_in_quick_entry,
    columns: (typeof f.columns === "number" ? f.columns : 1) as 1 | 2 | 3,
    searchIndex: typeof f.search_index === "number" ? f.search_index : 0,
    regex: typeof f.regex === "string" ? f.regex : undefined,
    validation: typeof f.custom_regex === "string" ? f.custom_regex : undefined,
    cssClass: typeof f.css_class === "string" ? f.css_class : undefined,
    compact: f.compact ? true : undefined,
    fullWidth: f.full_width ? true : undefined,
    sortOrder: typeof f.idx === "number" ? f.idx : 0,
    


  };
}

function buildSections(allFields: DocField[], dataFields: TrevoField[]): FormSection[] {
  const sections: FormSection[] = [];
  let currentSection: FormSection | null = null;
  let currentColumns = 1;

  for (const f of allFields) {
    if (f.fieldtype === "Section Break") {
      // Start new section
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        label: f.label ?? f.fieldname,
        fieldname: f.fieldname,
        collapsed: !!f.collapsed,

        columns: 1,
        fields: [],
        childTables: [],
      };
      currentColumns = 1;
    } else if (f.fieldtype === "Column Break") {
      // Increase columns in current section
      if (currentSection) {
      currentSection.columns = Math.max(currentSection.columns, (currentColumns + 1) as 1 | 2 | 3)
      }
      currentColumns++;

    } else if (f.fieldtype === "Tab Break") {
      // Each tab becomes its own section
      if (currentSection) {
        sections.push(currentSection);
      }
      currentSection = {
        label: f.label ?? f.fieldname,
        fieldname: f.fieldname,
        collapsed: false,
        columns: 1 as 1 | 2 | 3,
        fields: [],
        childTables: [],
      };
      currentColumns = 1;
    } else if (f.fieldtype === "Table") {
      // Child table
      if (currentSection) {
        currentSection.childTables.push({
          ...(f as unknown as TrevoField),
          label: f.label ?? f.fieldname,
        });
      }
    } else if (!STRUCTURAL_TYPES.has(f.fieldtype)) {
      // Data field — add to current section
      if (currentSection) {
        const enhanced = dataFields.find((df) => df.fieldname === f.fieldname);
        if (enhanced) {
          currentSection.fields.push(enhanced);
        }
      }
    }
  }

  // Don't forget the last section
  if (currentSection) {
    sections.push(currentSection);
  }

  // If no sections were created, create a default one
  if (sections.length === 0) {
    sections.push({
      label: "Details",
      fieldname: "_default",
      collapsed: false,
      columns: 1,
      fields: dataFields,
      childTables: [],
    });
  }

  return sections;
}

function determineLayout(structuralFields: DocField[]): FormLayout {
  const columnBreaks = structuralFields.filter((f) => f.fieldtype === "Column Break");
  const hasTabs = structuralFields.some((f) => f.fieldtype === "Tab Break");

  return {
    mode: "standard",
    columns: (columnBreaks.length > 0
    ? Math.min(columnBreaks.length + 1, 3)
    : 1) as 1 | 2 | 3,
    sections: [],
    showDescriptions: true,
    showLabels: true,
    labelPosition: hasTabs ? "top" : "left",
  };
}

/**
 * Get options for a Select/Autocomplete field
 */
export function getFieldOptions(field: TrevoField): string[] {
  if (!field.options) return [];
  return String(field.options)
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Check if a field type is a numeric field
 */
export function isNumericField(fieldtype: string): boolean {
  return ["Int", "Float", "Currency", "Percent"].includes(fieldtype);
}

/**
 * Check if a field type is a date/time field
 */
export function isDateTimeField(fieldtype: string): boolean {
  return ["Date", "Datetime", "Time"].includes(fieldtype);
}

/**
 * Check if a field type is a link field
 */
export function isLinkField(fieldtype: string): boolean {
  return ["Link", "Dynamic Link", "Autocomplete"].includes(fieldtype);
}

/**
 * Check if a field type is an attachment field
 */
export function isAttachmentField(fieldtype: string): boolean {
  return ["Attach", "Attach Image", "Signature"].includes(fieldtype);
}

/**
 * Get the display value for a field value
 */
export function formatFieldValue(value: unknown, fieldtype: string): string {
  if (value === null || value === undefined || value === "") return "-";

  switch (fieldtype) {
    case "Check":
      return value ? "Yes" : "No";
    case "Date":
      return typeof value === "string" ? value : String(value);
    case "Datetime":
      return typeof value === "string" ? value : String(value);
    case "Int":
    case "Float":
    case "Currency":
    case "Percent": {
      const num = typeof value === "number" ? value : Number(value);
      if (Number.isNaN(num)) return String(value);
      return new Intl.NumberFormat("en-US").format(num);
    }
    case "Currency":
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(Number(value));
    default:
      return String(value);
  }
}
