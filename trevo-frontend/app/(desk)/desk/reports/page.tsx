"use client";

import { useState, useMemo } from "react";
import { useReportsList, useReport } from "@/lib/hooks/useReport";
import { Card } from "@/components/shadcn/card";
import { BarChart3, Play, RefreshCw } from "lucide-react";

interface ReportColumn {
  fieldname: string;
  label: string;
}

export default function ReportsPage() {
  const { data: reports, isLoading: reportsLoading } = useReportsList();
  const [selectedReport, setSelectedReport] = useState<string>("");

  const { data: reportData, isLoading: reportLoading, refetch, error } = useReport(selectedReport);

  const reportList = useMemo(() => {
    if (!reports) return [];
    return reports
      .filter((r: { name: string; report_name?: string }) => r.name && !r.name.startsWith("__"))
      .map((r: { name: string; report_name?: string }) => ({
        value: r.report_name || r.name,
        label: r.report_name || r.name,
      }));
  }, [reports]);

  const columns: ReportColumn[] = useMemo(() => {
    if (!reportData?.columns || !Array.isArray(reportData.columns)) return [];
    const raw = reportData.columns;
    if (raw.length === 0) return [];
    if (typeof raw[0] === "string") {
      return raw.map((col) => ({ fieldname: col as string, label: col as string }));
    }
    return raw.map((col) => ({
      fieldname: (col as { fieldname?: string }).fieldname ?? String(col),
      label: (col as { label?: string }).label ?? String(col),
    }));
  }, [reportData]);

  const rows = useMemo(() => {
    if (!reportData?.result || !Array.isArray(reportData.result)) return [];
    return reportData.result as Array<Record<string, unknown>>;
  }, [reportData]);

  const getColumnValue = (row: Record<string, unknown>, col: ReportColumn) => {
    const key = col.fieldname;
    return row[key] !== undefined ? String(row[key]) : "-";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Reports</h1>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1 block text-xs font-medium text-zinc-500">Report</label>
            <select
              value={selectedReport}
              onChange={(e) => {
                setSelectedReport(e.target.value);
              }}
              className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
            >
              <option value="">Select a report</option>
              {reportsLoading ? (
                <option disabled>Loading...</option>
              ) : (
                reportList.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))
              )}
            </select>
          </div>

          <button
            onClick={() => selectedReport && refetch()}
            disabled={!selectedReport || reportLoading}
            className="flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            {reportLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            Run
          </button>
        </div>

        {error && (
          <div className="mt-3 text-sm text-red-600">
            {error instanceof Error ? error.message : "Failed to run report"}
          </div>
        )}
      </Card>

      {reportData && (
        <Card className="overflow-hidden">
          <div className="border-b border-zinc-200 px-4 py-3 dark:border-zinc-700">
            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              {selectedReport}
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
                  {columns.map((col) => (
                    <th
                      key={col.fieldname}
                      className="px-4 py-2 text-left text-xs font-medium text-zinc-500"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-8 text-center text-sm text-zinc-500">
                      No results found.
                    </td>
                  </tr>
                ) : (
                  rows.map((row, idx) => (
                    <tr key={String(row.__name || idx)} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                      {columns.map((col) => (
                        <td key={col.fieldname} className="px-4 py-2 text-zinc-700 dark:text-zinc-300">
                          {getColumnValue(row, col)}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {reportData.chart && (
            <div className="border-t border-zinc-200 p-4 dark:border-zinc-700">
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <BarChart3 className="h-4 w-4" />
                Chart data available (render with recharts)
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
