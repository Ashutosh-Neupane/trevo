"use client";

import { useParams } from "next/navigation";
import { useDoctype } from "@/lib/hooks/useDoctype";
import { FormBuilder, type BuilderLayoutSection } from "@/components/features/form-builder";
import { Card } from "@/components/shadcn/card";
import { Skeleton } from "@/components/Skeleton";

export default function FormBuilderPage() {
  const params = useParams<{ doctype: string }>();
  const doctype = decodeURIComponent(params.doctype);
  const { data: meta, isLoading } = useDoctype(doctype);

  const fields = (meta?.fields ?? [])
    .filter((f) => !["Section Break", "Column Break", "Tab Break", "Heading"].includes(f.fieldtype))
    .map((f) => ({
      fieldname: f.fieldname,
      label: (f.label ?? f.fieldname) as string,
      fieldtype: f.fieldtype,
      options: (f.options ?? undefined) as string | undefined,
      required: f.reqd === 1,
      hidden: f.hidden === 1,
      read_only: f.read_only === 1,
      description: f.description,
      default: f.default,
    })) as Parameters<typeof FormBuilder>[0]["initialFields"];

  const handleSave = async (layout: BuilderLayoutSection[]) => {
    console.log("Form layout saved for", doctype, layout);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Card className="p-6">
          <Skeleton className="h-96 w-full" />
        </Card>
      </div>
    );
  }

  if (!meta) {
    return (
      <div className="p-6 text-sm text-red-600">DocType not found.</div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Form Builder</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Design the layout for {doctype}
        </p>
      </div>
      <FormBuilder
        doctype={doctype}
        initialFields={fields}
        onSave={handleSave}
      />
    </div>
  );
}
