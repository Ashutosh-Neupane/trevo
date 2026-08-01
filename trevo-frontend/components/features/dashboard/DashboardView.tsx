"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/shadcn/card";
import { BarChart3, TrendingUp, RefreshCw } from "lucide-react";
import { BarChartComponent, LineChartComponent } from "@/components/charts";

interface DashboardWidget {
  name: string;
  chart_name?: string;
  chart_type?: string;
  source_doctype?: string;
  x_field?: string;
  y_field?: string;
  filters?: string;
  width?: string;
}

interface DashboardData {
  title: string;
  module?: string;
  widgets: DashboardWidget[];
}

interface DashboardViewProps {
  workspaceName?: string;
}

export function DashboardView({ workspaceName }: DashboardViewProps) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard", workspaceName],
    queryFn: async () => {
      const res = await fetch(`/api/doctype/Dashboard/${encodeURIComponent(workspaceName || "default")}`);
      if (!res.ok) throw new Error("Failed to fetch dashboard");
      return res.json() as Promise<DashboardData>;
    },
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-6 w-3/4 rounded bg-zinc-100 dark:bg-zinc-700" />
              <div className="h-4 w-1/2 rounded bg-zinc-100 dark:bg-zinc-700" />
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !data) {
    return (
      <Card className="p-6 text-sm text-red-600">
        Failed to load dashboard: {error instanceof Error ? error.message : "Unknown error"}
      </Card>
    );
  }

  const renderWidget = (widget: DashboardWidget, index: number) => {
    const colSpan = widget.width === "full" ? "lg:col-span-3" : widget.width === "half" ? "lg:col-span-2" : "lg:col-span-1";

    if (widget.chart_type && widget.source_doctype) {
      return (
        <Card key={widget.name || index} className={`p-4 ${colSpan}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {widget.chart_name || "Chart"}
              </p>
              <p className="text-xs text-zinc-500">{widget.source_doctype}</p>
            </div>
            <BarChart3 className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="h-64">
            {widget.chart_type === "line" ? (
              <LineChartComponent
                data={[]}
                xKey={widget.x_field || "x"}
                yKey={widget.y_field || "y"}
              />
            ) : (
              <BarChartComponent
                data={[]}
                xKey={widget.x_field || "x"}
                yKey={widget.y_field || "y"}
              />
            )}
          </div>
        </Card>
      );
    }

    return (
      <Card key={widget.name || index} className={`p-4 ${colSpan}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-zinc-500">{widget.chart_name || "Number Card"}</p>
            <p className="mt-1 text-3xl font-semibold text-zinc-900 dark:text-zinc-100">—</p>
          </div>
          <div className="rounded-lg bg-zinc-100 p-2 dark:bg-zinc-700">
            <TrendingUp className="h-5 w-5 text-zinc-500" />
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            {data.title || "Dashboard"}
          </h1>
          {data.module && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Module: {data.module}</p>
          )}
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {data.widgets.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-sm text-zinc-500">This dashboard is empty.</p>
          <p className="mt-1 text-xs text-zinc-400">Add widgets in Frappe.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.widgets.map((widget, index) => renderWidget(widget, index))}
        </div>
      )}
    </div>
  );
}
