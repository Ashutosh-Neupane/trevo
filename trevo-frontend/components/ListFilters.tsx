"use client";

import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/shadcn/popover";
import { Button } from "@/components/shadcn/button";
import { Filter } from "lucide-react";
import type { FilterOperator } from "@/lib/frappe/types";

export type FilterDef = {
  fieldname: string;
  label: string;
  type: "text" | "select" | "date" | "number";
  options?: Array<{ value: string; label: string }>;
  operators?: FilterOperator[];
};

interface FilterValue {
  value: string;
  operator: FilterOperator;
  valueTo?: string;
}

interface ListFiltersProps {
  filters: Record<string, FilterValue>;
  onFiltersChange: (filters: Record<string, FilterValue>) => void;
  availableFilters: FilterDef[];
}

const DEFAULT_OPERATORS: Record<string, FilterOperator[]> = {
  text: ["like", "=", "!=", "is", "not like"],
  select: ["=", "!=", "like", "not like", "in", "not in"],
  date: ["=", "!=", ">", "<", ">=", "<=", "Between"],
  number: ["=", "!=", ">", "<", ">=", "<=", "Between"],
};

export default function ListFilters({ filters, onFiltersChange, availableFilters }: ListFiltersProps) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, FilterValue>>({});

  const activeCount = Object.values(filters).filter((f) => f.value || f.valueTo).length;

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

  const updateDraft = (fieldname: string, value: string, key?: "value" | "valueTo") => {
    setDraft((prev) => {
      const next = { ...prev };
      const current = next[fieldname] || { value: "", operator: "=" };
      if (key === "valueTo") {
        if (value) next[fieldname] = { ...current, valueTo: value }; else if (current.value) next[fieldname] = current; else delete next[fieldname];
      } else {
        if (value) next[fieldname] = { ...current, value }; else if (current.valueTo) next[fieldname] = { ...current, value: "" }; else delete next[fieldname];
      }
      return next;
    });
  };

  const updateOperator = (fieldname: string, operator: FilterOperator) => {
    setDraft((prev) => {
      const next = { ...prev };
      const current = next[fieldname] || { value: "", operator: "=" };
      if (current.value) {
        next[fieldname] = operator === "Between" ? { ...current, operator, value: "", valueTo: "" } : { ...current, operator };
      } else {
        delete next[fieldname];
      }
      return next;
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-zinc-300 bg-white px-3 text-sm font-medium transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
        onClick={openFilters}
      >
        <Filter className="h-4 w-4" />
        Filters
        {activeCount > 0 && (
          <span className="rounded-full bg-zinc-900 px-1.5 py-0.5 text-xs text-white dark:bg-zinc-100 dark:text-zinc-900">
            {activeCount}
          </span>
        )}
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
            {availableFilters.map((f) => {
              const ops = f.operators || DEFAULT_OPERATORS[f.type] || DEFAULT_OPERATORS.text;
              const current = draft[f.fieldname] || { value: "", operator: ops[0] as FilterOperator };
              const isBetween = current.operator === "Between";
              return (
                <div key={f.fieldname}>
                  <label className="mb-1 block text-xs font-medium text-zinc-500">{f.label}</label>
                  <div className="flex gap-2">
                    <select
                      value={current.operator}
                      onChange={(e) => updateOperator(f.fieldname, e.target.value as FilterOperator)}
                      className="w-28 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                    >
                      {ops.map((op) => (
                        <option key={op} value={op}>{op}</option>
                      ))}
                    </select>
                    {isBetween ? (
                      <div className="flex flex-1 gap-1">
                        <input
                          type={f.type === "date" ? "date" : f.type === "number" ? "number" : "text"}
                          value={current.value}
                          onChange={(e) => updateDraft(f.fieldname, e.target.value, "value")}
                          placeholder="From"
                          className="flex-1 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                        />
                        <input
                          type={f.type === "date" ? "date" : f.type === "number" ? "number" : "text"}
                          value={current.valueTo || ""}
                          onChange={(e) => updateDraft(f.fieldname, e.target.value, "valueTo")}
                          placeholder="To"
                          className="flex-1 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                        />
                      </div>
                    ) : f.type === "select" && f.options ? (
                      <select
                        value={current.value}
                        onChange={(e) => updateDraft(f.fieldname, e.target.value)}
                        className="flex-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                      >
                        <option value="">All</option>
                        {f.options.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : f.type === "date" ? (
                      <input
                        type="date"
                        value={current.value}
                        onChange={(e) => updateDraft(f.fieldname, e.target.value)}
                        className="flex-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                      />
                    ) : f.type === "number" ? (
                      <input
                        type="number"
                        value={current.value}
                        onChange={(e) => updateDraft(f.fieldname, e.target.value)}
                        className="flex-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                      />
                    ) : (
                      <input
                        type="text"
                        value={current.value}
                        onChange={(e) => updateDraft(f.fieldname, e.target.value)}
                        placeholder={`Search ${f.label}...`}
                        className="flex-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                      />
                    )}
                  </div>
                </div>
              );
            })}
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
