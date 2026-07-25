"use client";

import { useList } from "@/lib/hooks/useList";

export default function TasksPage() {
  const { data: tasks, isLoading } = useList("Task", {
    fields: ["name", "subject", "status", "priority", "exp_end_date"],
    order_by: "modified desc",
    limit: 50,
  });

  const rows = (tasks as unknown as Array<Record<string, unknown>>) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Tasks</h1>
      </div>

      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-zinc-500">No tasks found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Subject</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {rows.map((row) => (
                <tr key={row.name as string} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-4 py-3 text-zinc-900 dark:text-zinc-100">{String(row.subject ?? "-")}</td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{String(row.status ?? "-")}</td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">{String(row.priority ?? "-")}</td>
                  <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                    {row.exp_end_date ? String(row.exp_end_date) : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
