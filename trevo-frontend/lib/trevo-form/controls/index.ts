import type { DocField } from "@/lib/frappe/types";

export interface FieldControlProps {
  field: DocField;
  value: unknown;
  onChange: (value: unknown) => void;
  error?: string;
  disabled?: boolean;
}

export { default as FormField } from "./FormField";
export { default as LinkField } from "./LinkField";
export { default as SelectField } from "./SelectField";
export { default as DateField } from "./DateField";
export { default as DateTimeField } from "./DateTimeField";
export { default as CheckField } from "./CheckField";
export { default as TextEditorField } from "./TextEditorField";
export { default as AttachmentField } from "./AttachmentField";
export { default as IntField } from "./IntField";
export { default as FloatField } from "./FloatField";
export { default as CurrencyField } from "./CurrencyField";
export { default as TableField } from "./TableField";
export { default as HTMLField } from "./HTMLField";
export { default as CodeField } from "./CodeField";
export { default as ReadOnlyField } from "./ReadOnlyField";
export { default as PasswordField } from "./PasswordField";
export { default as GeolocationField } from "./GeolocationField";
export { default as SignatureField } from "./SignatureField";
export { default as RatingField } from "./RatingField";
export { default as BarcodeField } from "./BarcodeField";
export { default as DurationField } from "./DurationField";
export { default as JSONField } from "./JSONField";
export { default as TableMultiSelectField } from "./TableMultiSelectField";
