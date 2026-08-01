"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/shadcn/button";
import { format, addDays, subDays, startOfMonth, endOfMonth, endOfQuarter, differenceInDays, parseISO } from "date-fns";

interface GanttTask {
  id: string;
  title: string;
  start: string;
  end: string;
  progress: number;
  docstatus: number;
  modified: string;
}

type ViewMode = "day" | "week" | "month" | "quarter";

interface GanttViewProps {
  doctype: string;
  startField?: string;
  endField?: string;
  progressField?: string;
  titleField?: string;
}

const GANTT_BAR_COLORS = [
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-yellow-500",
  "bg-pink-500",
  "bg-indigo-500",
  "bg-teal-500",
  "bg-orange-500",
];

export function GanttView({
  doctype,
  startField = "expected_start_date",
  endField = "expected_end_date",
  progressField = "progress",
  titleField = "subject",
}: GanttViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);

  // Fetch tasks
  const { data, isLoading } = useQuery({
    queryKey: ["gantt", doctype, startField, endField],
    queryFn: async () => {
      const params = new URLSearchParams({
        start_field: startField,
        end_field: endField,
        progress_field: progressField,
        title_field: titleField,
      });
      const res = await fetch(
        `/api/doctype/${encodeURIComponent(doctype)}/gantt?${params.toString()}`,
      );
      if (!res.ok) throw new Error("Failed to fetch gantt data");
      const json = (await res.json()) as { tasks: GanttTask[] };
      return json.tasks;
    },
  });

  const tasks = data ?? [];

  // Calculate date range
  const dateRange = useMemo(() => {
    if (tasks.length === 0) {
      const now = new Date();
      return { start: startOfMonth(now), end: endOfMonth(now) };
    }

    let minDate = parseISO(tasks[0].start);
    let maxDate = parseISO(tasks[0].end);

    for (const task of tasks) {
      const s = parseISO(task.start);
      const e = parseISO(task.end);
      if (s < minDate) minDate = s;
      if (e > maxDate) maxDate = e;
    }

    // Add padding
    minDate = subDays(minDate, 7);
    maxDate = addDays(maxDate, 7);

    return { start: minDate, end: maxDate };
  }, [tasks]);

  // Generate timeline headers based on view mode
  const timelineHeaders = useMemo(() => {
    const headers: Array<{ label: string; days: number; start: Date }> = [];
    let current = dateRange.start;

    while (current < dateRange.end) {
      let label: string;
      let next: Date;

      switch (viewMode) {
        case "day":
          label = format(current, "MMM d");
          next = addDays(current, 1);
          break;
        case "week":
          label = `W${format(current, "w")}`;
          next = addDays(current, 7);
          break;
        case "quarter":
          label = `Q${Math.ceil((current.getMonth() + 1) / 3)} ${format(current, "yy")}`;
          next = endOfQuarter(current);
          next = addDays(next, 1);
          break;
        case "month":
        default:
          label = format(current, "MMM yyyy");
          next = addDays(endOfMonth(current), 1);
          break;
      }

      headers.push({
        label,
        days: differenceInDays(next, current),
        start: current,
      });
      current = next;
    }

    return headers;
  }, [dateRange, viewMode]);

  const totalDays = differenceInDays(dateRange.end, dateRange.start);
  const dayWidth = viewMode === "day" ? 60 : viewMode === "week" ? 24 : viewMode === "month" ? 12 : 8;
  const timelineWidth = totalDays * dayWidth;

  const getTaskPosition = useCallback(
    (task: GanttTask) => {
      const taskStart = parseISO(task.start);
      const taskEnd = parseISO(task.end);
      const startOffset = differenceInDays(taskStart, dateRange.start);
      const duration = Math.max(1, differenceInDays(taskEnd, taskStart));

      return {
        left: startOffset * dayWidth,
        width: duration * dayWidth,
      };
    },
    [dateRange, dayWidth],
  );

const handleScroll = (_direction: "left" | "right") => {
    const scrollAmount = viewMode === "day" ? 7 : viewMode === "week" ? 4 : viewMode === "month" ? 3 : 1;
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-300 border-t-zinc-900" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Gantt Chart
        </h2>
        <div className="flex items-center gap-2">
          {/* View mode buttons */}
          <div className="flex rounded-lg border border-zinc-300 dark:border-zinc-700 overflow-hidden">
            {(["day", "week", "month", "quarter"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  viewMode === mode
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => handleScroll("left")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleScroll("right")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700">
          <p className="text-sm text-zinc-500">
            No tasks with date ranges found for this doctype.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
          <div className="overflow-x-auto">
            <div className="min-w-max" style={{ width: 800 + timelineWidth }}>
              {/* Timeline header */}
              <div className="flex border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900">
                {/* Task names column */}
                <div className="w-64 shrink-0 border-r border-zinc-200 dark:border-zinc-700 p-3">
                  <span className="text-xs font-medium text-zinc-500">Task</span>
                </div>
                {/* Timeline headers */}
                <div className="flex">
                  {timelineHeaders.map((header, i) => (
                    <div
                      key={i}
                      style={{ width: header.days * dayWidth }}
                      className="border-r border-zinc-200 px-2 py-3 text-center text-xs font-medium text-zinc-500 dark:border-zinc-700"
                    >
                      {header.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Task rows */}
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {tasks.map((task, index) => {
                  const pos = getTaskPosition(task);
                  return (
                    <div
                      key={task.id}
                      className="flex hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                      onMouseEnter={() => setHoveredTask(task.id)}
                      onMouseLeave={() => setHoveredTask(null)}
                    >
                      {/* Task name */}
                      <div className="w-64 shrink-0 border-r border-zinc-200 dark:border-zinc-700 p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">
                            {task.title}
                          </span>
                          <span className="text-[10px] text-zinc-400">
                            {Math.round(task.progress)}%
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-400">
                          {format(parseISO(task.start), "MMM d")} - {format(parseISO(task.end), "MMM d")}
                        </div>
                      </div>

                      {/* Gantt bar */}
                      <div className="relative flex-1" style={{ minHeight: 48 }}>
                        <div
                          className="absolute top-3"
                          style={{ left: pos.left, width: pos.width }}
                        >
                          <div
                            className={`relative h-6 rounded-md ${
                              GANTT_BAR_COLORS[index % GANTT_BAR_COLORS.length]
                            } opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                          >
                            {/* Progress indicator */}
                            {task.progress > 0 && (
                              <div
                                className="absolute inset-y-0 left-0 rounded-md bg-white/20"
                                style={{ width: `${task.progress}%` }}
                              />
                            )}
                            {/* Task label */}
                            <span className="absolute inset-0 flex items-center px-2 text-[10px] font-medium text-white truncate">
                              {task.title}
                            </span>
                          </div>
                        </div>

                        {/* Hover tooltip */}
                        {hoveredTask === task.id && (
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-10 rounded-lg bg-zinc-900 px-2 py-1 text-xs text-white whitespace-nowrap dark:bg-zinc-100 dark:text-zinc-900">
                            {task.title} - {Math.round(task.progress)}% complete
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
