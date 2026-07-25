"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shadcn/popover";
import { Button } from "@/components/shadcn/button";
import { Filter } from "lucide-react";

export type FilterDef = {
  fieldname: string;
  label: string;
  type: "text" | "select" | "date" | "number";
  options?: Array<{ value: string; label: string }>;
};

interface ListFiltersProps {
  filters: Record<string, string>;
  onFiltersChange: (filters: Record<string, string>) => void;
  availableFilters: FilterDef[];
}

export default function ListFilters({ filters, onFiltersChange, availableFilters }: ListFiltersProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});

  const activeCount = Object.values(filters).filter(Boolean).length;

  const openFilters = () => {
    setDraft({ ...filters });
    setOpen(true);
  };

  const apply = () => {
    onFiltersChange(draft);
    setOpen(false);
  };

  const clear = () => {
    setDraft({});
    onFiltersChange({});
    setOpen(false);
  };

  const updateDraft = (fieldname: string, value: string) => {
    setDraft((prev) => {
      const next = { ...prev };
      if (value) next[fieldname] = value; else delete next[fieldname];
      return next;
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <Button variant="outline" size="sm" onClick={openFilters} className="gap-1.5">
          <Filter className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="rounded-full bg-zinc-900 px-1.5 py-0.5 text-xs text-white dark:bg-zinc-100 dark:text-zinc-900">
              {activeCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">Filters</h3>
            {activeCount > 0 && (
              <button onClick={clear} className="text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400">
                Clear all
              </button>
            )}
          </div>
          <div className="space-y-3">
            {availableFilters.map((f) => (
              <div key={f.fieldname}>
                <label className="mb-1 block text-xs font-medium text-zinc-500">{f.label}</label>
                {f.type === "select" && f.options ? (
                  <select
                    value={draft[f.fieldname] || ""}
                    onChange={(e) => updateDraft(f.fieldname, e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  >
                    <option value="">All</option>
                    {f.options.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : f.type === "date" ? (
                  <input
                    type="date"
                    value={draft[f.fieldname] || ""}
                    onChange={(e) => updateDraft(f.fieldname, e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                ) : f.type === "number" ? (
                  <input
                    type="number"
                    value={draft[f.fieldname] || ""}
                    onChange={(e) => updateDraft(f.fieldname, e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                ) : (
                  <input
                    type="text"
                    value={draft[f.fieldname] || ""}
                    onChange={(e) => updateDraft(f.fieldname, e.target.value)}
                    placeholder={`Search ${f.label}...`}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={apply}>Apply</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
