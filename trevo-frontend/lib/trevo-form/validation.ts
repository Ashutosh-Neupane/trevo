import type { DocField } from "@/lib/frappe/types";

export interface ValidationError {
  fieldname: string;
  message: string;
}

export function validateFields(fields: DocField[], values: Record<string, unknown>): ValidationError[] {
  const errors: ValidationError[] = [];

  for (const field of fields) {
    if (field.hidden || field.read_only) continue;

    const rawValue = values[field.fieldname];
    const stringValue = rawValue === null || rawValue === undefined ? "" : String(rawValue);

    if (field.reqd && (stringValue === "" || stringValue === "0")) {
      errors.push({ fieldname: field.fieldname, message: `${field.label || field.fieldname} is required` });
      continue;
    }

    if (!stringValue) continue;

    if (field.fieldtype === "Int" || field.fieldtype === "Float" || field.fieldtype === "Currency") {
      const num = Number(rawValue);
      if (Number.isNaN(num)) {
        errors.push({ fieldname: field.fieldname, message: `${field.label || field.fieldname} must be a number` });
        continue;
      }
      if (typeof field.min !== "undefined" && field.min !== null && num < Number(field.min)) {
        errors.push({ fieldname: field.fieldname, message: `${field.label || field.fieldname} must be at least ${field.min}` });
      }
      if (typeof field.max !== "undefined" && field.max !== null && num > Number(field.max)) {
        errors.push({ fieldname: field.fieldname, message: `${field.label || field.fieldname} must be at most ${field.max}` });
      }
    }

    if ((field.fieldtype === "Data" || field.fieldtype === "Text") && field.options) {
      try {
        const regex = new RegExp(field.options);
        if (!regex.test(stringValue)) {
          errors.push({ fieldname: field.fieldname, message: `${field.label || field.fieldname} format is invalid` });
        }
      } catch {
        // ignore invalid regex patterns
      }
    }
  }

  return errors;
}
