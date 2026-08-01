export interface FormBuilderField {
  fieldname: string;
  label: string;
  fieldtype: string;
  options?: string;
  required?: boolean;
  hidden?: boolean;
  read_only?: boolean;
  description?: string;
  default?: unknown;
}

export interface BuilderColumn {
  id: string;
  fields: FormBuilderField[];
}

export interface BuilderLayoutSection {
  id: string;
  name: string;
  columns: BuilderColumn[];
}

export interface FieldPropertiesProps {
  field: FormBuilderField | null;
  onUpdate?: (field: FormBuilderField) => void;
}
