"use client";

import { useList } from "@/lib/hooks/useList";
import { Card } from "@/components/shadcn/card";
import { Badge } from "@/components/shadcn/badge";
import { CheckCircle2, Circle, Clock, AlertTriangle } from "lucide-react";

const STATUS_ICONS: Record<string, React.ElementType> = {
  "To Do": Circle,
  "In Progress": Clock,
  "Completed": CheckCircle2,
  "Cancelled": AlertTriangle,
  "Pending": Clock,
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "To Do": "outline",
  "In Progress": "default",
  "Completed": "secondary",
  "Cancelled": "destructive",
  "Pending": "outline",
};

export default function TasksPage() {
  const { data: tasks, isLoading } = useList("Task", {
    fields: ["name", "subject", "status", "priority", "exp_start_date", "exp_end_date", "description"],
    order_by: "modified desc",
    limit: 100,
  });

  const rows = (tasks as unknown as Array<Record<string, unknown>>) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Tasks</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-4 w-3/4 rounded bg-zinc-100 dark:bg-zinc-700" />
                <div className="h-3 w-1/2 rounded bg-zinc-100 dark:bg-zinc-700" />
              </div>
            </Card>
          ))
        ) : rows.length === 0 ? (
          <Card className="col-span-full p-12 text-center">
            <p className="text-sm text-zinc-500">No tasks found.</p>
          </Card>
        ) : (
          rows.map((row) => {
            const StatusIcon = STATUS_ICONS[row.status as string] ?? Circle;
            const variant = STATUS_VARIANTS[row.status as string] ?? "outline";
            return (
              <Card key={row.name as string} className="p-4 hover:shadow-sm transition-shadow cursor-pointer">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <StatusIcon className="h-4 w-4 text-zinc-500 flex-shrink-0" />
                      <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {String(row.subject ?? "Untitled Task")}
                      </h3>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500 line-clamp-2">
                      {String(row.description ?? "-")}
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <Badge variant={variant} className="text-xs">
                        {String(row.status ?? "To Do")}
                      </Badge>
                      {typeof row.priority === "string" && (
                        <span className="text-xs text-zinc-500">{row.priority}</span>
                      )}
                    </div>
                  </div>
                </div>
                {(typeof row.exp_end_date === "string" || typeof row.exp_start_date === "string") && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-zinc-500">
                    <Clock className="h-3 w-3" />
                    {typeof row.exp_start_date === "string" && row.exp_start_date}
                    {typeof row.exp_start_date === "string" && typeof row.exp_end_date === "string" && " → "}
                    {typeof row.exp_end_date === "string" && row.exp_end_date}
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
