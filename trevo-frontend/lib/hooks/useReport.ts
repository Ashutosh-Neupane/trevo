"use client";

import { useQuery } from "@tanstack/react-query";
import { runReport, fetchReportMeta } from "@/lib/frappe/report";
import type { ReportResult } from "@/lib/frappe/report";

export function useReport(reportName: string, filters?: Record<string, unknown>) {
  return useQuery<ReportResult>({
    queryKey: ["report", reportName, filters],
    queryFn: () => runReport(reportName, filters),
    enabled: !!reportName && reportName !== "_none",
  });
}

export function useReportMeta(reportName: string) {
  return useQuery({
    queryKey: ["report-meta", reportName],
    queryFn: () => fetchReportMeta(reportName),
    enabled: !!reportName && reportName !== "_none",
  });
}

export function useReportsList() {
  return useQuery({
    queryKey: ["reports-list"],
    queryFn: async () => {
      const { data } = await fetch("/api/doctype/Report/doc", {
        headers: { Accept: "application/json" },
      }).then((r) => r.json());
      return ((data as { message?: Array<{ name: string; report_name?: string }> } | null)?.message ?? []) as Array<{ name: string; report_name?: string }>;
    },
    staleTime: 5 * 60 * 1000,
  });
}
