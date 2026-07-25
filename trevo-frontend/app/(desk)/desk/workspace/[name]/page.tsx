"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useWorkspace } from "@/lib/hooks/useWorkspaces";
import { Card } from "@/components/shadcn/card";
import {
  FileText,
  ExternalLink,
  BarChart3,
  LayoutDashboard,
  Plus,
} from "lucide-react";

const SHORTCUT_ICONS: Record<string, React.ElementType> = {
  DocType: FileText,
  Page: LayoutDashboard,
  Report: BarChart3,
  Dashboard: LayoutDashboard,
  URL: ExternalLink,
  Help: FileText,
};

export default function WorkspacePage() {
  const params = useParams<{ name: string }>();
  const name = decodeURIComponent(params.name);
  const { data: workspace, isLoading, error } = useWorkspace(name);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-sm text-red-600">Failed to load workspace: {error.message}</div>
    );
  }

  if (!workspace) {
    return (
      <div className="p-6 text-sm text-zinc-600">Workspace not found.</div>
    );
  }

  const shortcuts = workspace.shortcuts ?? [];
  const links = workspace.links ?? [];
  const numberCards = workspace.number_cards ?? [];
  const charts = workspace.charts ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            {workspace.title || name}
          </h1>
          {workspace.module && (
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Module: {workspace.module}
            </p>
          )}
        </div>
        <Link
          href={`/desk/doctype/${encodeURIComponent("Workspace")}/new`}
          className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
        >
          <span className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            New Shortcut
          </span>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {shortcuts.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Shortcuts
              </h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {shortcuts.map((shortcut) => {
                  const Icon = SHORTCUT_ICONS[shortcut.type] ?? FileText;
                  const href =
                    shortcut.type === "DocType"
                      ? `/desk/doctype/${encodeURIComponent(shortcut.link_to)}`
                      : shortcut.type === "Page"
                        ? shortcut.link_to
                        : shortcut.type === "Report"
                          ? `/desk/reports?report=${encodeURIComponent(shortcut.link_to)}`
                          : shortcut.link_to || "#";

                  return (
                    <Link
                      key={shortcut.label + shortcut.link_to}
                      href={href}
                      className="flex flex-col items-center gap-2 rounded-lg border border-zinc-200 bg-white p-4 text-center hover:border-zinc-300 hover:shadow-sm dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-zinc-600"
                    >
                      <div className="rounded-lg bg-zinc-100 p-2 dark:bg-zinc-700">
                        <Icon className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
                      </div>
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2">
                        {shortcut.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {links.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Links
              </h2>
              <Card className="divide-y divide-zinc-200 dark:divide-zinc-700">
                {links.map((link) => {
                  const Icon = SHORTCUT_ICONS[link.type ?? "URL"] ?? ExternalLink;
                  const href =
                    link.type === "DocType"
                      ? `/desk/doctype/${encodeURIComponent(link.link_to)}`
                      : link.type === "Page"
                        ? link.link_to
                        : link.type === "Report"
                          ? `/desk/reports?report=${encodeURIComponent(link.link_to)}`
                          : link.link_to || "#";

                  return (
                    <Link
                      key={link.label + link.link_to}
                      href={href}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                    >
                      <Icon className="h-4 w-4 text-zinc-500" />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {link.label}
                        </div>
                        {link.dependencies && (
                          <div className="text-xs text-zinc-500">
                            {link.dependencies}
                          </div>
                        )}
                      </div>
                      <ExternalLink className="h-4 w-4 text-zinc-400" />
                    </Link>
                  );
                })}
              </Card>
            </section>
          )}

          {charts.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Charts
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {charts.map((chart) => (
                  <Card key={chart.chart_name} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-zinc-100 p-2 dark:bg-zinc-700">
                        <BarChart3 className="h-5 w-5 text-zinc-600 dark:text-zinc-300" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                          {chart.label || chart.chart_name}
                        </p>
                        <p className="text-xs text-zinc-500">Chart</p>
                      </div>
                    </div>
                    <div className="mt-4 rounded-lg border border-dashed border-zinc-200 p-6 text-center dark:border-zinc-700">
                      <p className="text-xs text-zinc-500">Chart rendering coming soon</p>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {shortcuts.length === 0 && links.length === 0 && charts.length === 0 && (
            <Card className="p-8 text-center">
              <LayoutDashboard className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" />
              <p className="mt-2 text-sm text-zinc-500">This workspace is empty.</p>
              <p className="text-xs text-zinc-400">Add shortcuts, links, or number cards in Frappe.</p>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {numberCards.length > 0 && (
            <section>
              <h2 className="mb-3 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Number Cards
              </h2>
              <div className="space-y-3">
                {numberCards.map((card) => (
                  <Card key={card.number_card_name} className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-zinc-500">
                          {card.label || card.number_card_name}
                        </p>
                        <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                          —
                        </p>
                      </div>
                      <div className="rounded-lg bg-zinc-100 p-2 dark:bg-zinc-700">
                        <BarChart3 className="h-5 w-5 text-zinc-500" />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
