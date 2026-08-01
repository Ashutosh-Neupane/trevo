"use client";

import { Card } from "@/components/shadcn/card";
import { Input } from "@/components/shadcn/input";
import { Label } from "@/components/shadcn/label";
import { Switch } from "@/components/shadcn/switch";
import { Textarea } from "@/components/shadcn/textarea";
import type { FormBuilderField, FieldPropertiesProps } from "./types";

export function FieldProperties({ field, onUpdate }: FieldPropertiesProps) {
  if (!field) {
    return (
      <Card className="p-6">
        <p className="text-sm text-zinc-500">Select a field to edit its properties.</p>
      </Card>
    );
  }

  const updateField = (updates: Partial<FormBuilderField>) => {
    onUpdate?.({ ...field, ...updates });
  };

  return (
    <Card className="p-6">
      <h3 className="mb-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">Field Properties</h3>
      <div className="space-y-4">
        <div>
          <Label>Label</Label>
          <Input
            value={field.label || ""}
            onChange={(e) => updateField({ label: e.target.value })}
            className="mt-1"
          />
        </div>

        <div>
          <Label>Fieldname</Label>
          <Input value={field.fieldname} disabled className="mt-1 bg-zinc-50 dark:bg-zinc-800" />
        </div>

        <div>
          <Label>Field Type</Label>
          <Input value={field.fieldtype} disabled className="mt-1 bg-zinc-50 dark:bg-zinc-800" />
        </div>

        {field.fieldtype === "Select" || field.fieldtype === "Autocomplete" ? (
          <div>
            <Label>Options</Label>
            <Textarea
              value={field.options || ""}
              onChange={(e) => updateField({ options: e.target.value })}
              placeholder="Option 1\nOption 2\nOption 3"
              className="mt-1"
              rows={4}
            />
          </div>
        ) : null}

        <div>
          <Label>Description</Label>
          <Textarea
            value={field.description || ""}
            onChange={(e) => updateField({ description: e.target.value })}
            placeholder="Help text for this field..."
            className="mt-1"
            rows={2}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label>Required</Label>
          <Switch checked={field.required || false} onCheckedChange={(checked) => updateField({ required: checked })} />
        </div>

        <div className="flex items-center justify-between">
          <Label>Hidden</Label>
          <Switch checked={field.hidden || false} onCheckedChange={(checked) => updateField({ hidden: checked })} />
        </div>

        <div className="flex items-center justify-between">
          <Label>Read Only</Label>
          <Switch checked={field.read_only || false} onCheckedChange={(checked) => updateField({ read_only: checked })} />
        </div>
      </div>
    </Card>
  );
}
