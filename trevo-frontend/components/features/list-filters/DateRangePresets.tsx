"use client";

import { useMemo } from "react";
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear, startOfQuarter, endOfQuarter } from "date-fns";

export interface DateRangePreset {
  label: string;
  from: string;
  to: string;
}

interface DateRangePresetsProps {
  onSelect: (preset: DateRangePreset) => void;
  fieldname: string;
}

export function DateRangePresets({ onSelect, fieldname }: DateRangePresetsProps) {
  const presets = useMemo<DateRangePreset[]>(() => {
    const today = new Date();
    const fmt = (d: Date) => format(d, "yyyy-MM-dd");

    return [
      { label: "Today", from: fmt(today), to: fmt(today) },
      { label: "Yesterday", from: fmt(subDays(today, 1)), to: fmt(subDays(today, 1)) },
      { label: "This Week", from: fmt(subDays(today, today.getDay())), to: fmt(today) },
      { label: "This Month", from: fmt(startOfMonth(today)), to: fmt(endOfMonth(today)) },
      { label: "This Quarter", from: fmt(startOfQuarter(today)), to: fmt(endOfQuarter(today)) },
      { label: "This Year", from: fmt(startOfYear(today)), to: fmt(endOfYear(today)) },
      { label: "Last 7 Days", from: fmt(subDays(today, 6)), to: fmt(today) },
      { label: "Last 30 Days", from: fmt(subDays(today, 29)), to: fmt(today) },
      { label: "Last 90 Days", from: fmt(subDays(today, 89)), to: fmt(today) },
      { label: "Last Month", from: fmt(startOfMonth(subMonths(today, 1))), to: fmt(endOfMonth(subMonths(today, 1))) },
      { label: "Last Quarter", from: fmt(startOfQuarter(subMonths(today, 3))), to: fmt(endOfQuarter(subMonths(today, 3))) },
      { label: "Last Year", from: fmt(startOfYear(subMonths(today, 12))), to: fmt(endOfYear(subMonths(today, 12))) },
    ];
  }, []);

  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-zinc-500">
        Quick Select for {fieldname}
      </label>
      <div className="grid grid-cols-2 gap-1">
        {presets.map((preset) => (
          <button
            key={preset.label}
            onClick={() => onSelect(preset)}
            className="rounded px-2 py-1 text-left text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}
