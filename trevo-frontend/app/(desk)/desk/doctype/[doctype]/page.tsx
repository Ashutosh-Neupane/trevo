"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useDoctype } from "@/lib/hooks/useDoctype";
import { useList } from "@/lib/hooks/useList";
import { useListCount } from "@/lib/hooks/useList";
import type { FilterOperator } from "@/lib/frappe/types";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default function DoctypeListView() {
  const params = useParams<{ doctype: string }>();
  const router = useRouter();
  const doctype = decodeURIComponent(params.doctype);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState<string>("modified");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filters, setFilters] = useState<Array<[string, string, FilterOperator, unknown]>>([]);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const { data: meta } = useDoctype(doctype);

  const listFields = useMemo(() => {
    const fields = meta?.fields;
    if (!fields) return [];
    return fields.filter((f) => f.in_list_view && !["Section Break", "Column Break", "Tab Break", "Heading"].includes(f.fieldtype));
  }, [meta?.fields]);

  const listParams = useMemo(
    () => ({
      ...(listFields.length > 0 ? { fields: listFields.map((f) => f.fieldname) } : {}),
      filters,
      order_by: `${sortBy} ${sortOrder}`,
      limit_start: page * pageSize,
      limit_page_length: pageSize,
    }),
    [listFields, filters, sortBy, sortOrder, page, pageSize],
  );

  const { data: listData, isLoading, refetch } = useList(doctype, listParams);
  const { data: countData } = useListCount(doctype, filters);

  const rows = useMemo(() => (listData as unknown as Array<Record<string, unknown>>) ?? [], [listData]);
  const total = countData ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setPage(0);
  };

  const handleSelectAll = () => {
    if (selectedRows.size === rows.length) {
      setSelectedRows(new Set());
    } else {
      setSelectedRows(new Set(rows.map((r) => String(r.name))));
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Delete ${selectedRows.size} records?`)) return;
    await fetch(`/api/doctype/${encodeURIComponent(doctype)}/doc`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ names: Array.from(selectedRows) }),
    });
    setSelectedRows(new Set());
    refetch();
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? " ↑" : " ↓";
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{doctype}</h1>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
            {total}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 rounded-lg border border-zinc-300 px-3 py-1.5 pl-9 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            />
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
              showFilters
                ? "border-zinc-900 bg-zinc-900 text-white"
                : "border-zinc-300 hover:bg-zinc-50"
            }`}
          >
            Filters
          </button>

          <Link
            href={`/desk/doctype/${encodeURIComponent(doctype)}/new`}
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            New
          </Link>
        </div>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-700 dark:bg-zinc-800">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {listFields.slice(0, 4).map((field) => (
              <div key={field.fieldname}>
                <label className="mb-1 block text-xs font-medium text-zinc-500">{field.label || field.fieldname}</label>
                <input
                  type="text"
                  placeholder={`Filter ${field.label || field.fieldname}...`}
                  value={String(filters.find(f => f[1] === field.fieldname)?.[3] ?? "")}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFilters(prev => {
                      const next = prev.filter(f => f[1] !== field.fieldname);
                      if (val) next.push([doctype, field.fieldname, "like", `%${val}%`]);
                      return next;
                    });
                  }}
                  className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-sm dark:border-zinc-600 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Data table */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900" />
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-sm text-zinc-500">No records found.</p>
          </div>
        ) : (
          <>
            {/* Bulk actions */}
            {selectedRows.size > 0 && (
              <div className="flex items-center justify-between border-b border-zinc-200 bg-blue-50 px-4 py-2 dark:border-zinc-700 dark:bg-blue-900/20">
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  {selectedRows.size} selected
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleBulkDelete}
                    className="rounded-lg bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedRows(new Set())}
                    className="rounded-lg border border-zinc-300 px-3 py-1 text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
                    <th className="w-10 px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.size === rows.length && rows.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-zinc-300"
                      />
                    </th>
                    {listFields.map((field) => (
                      <th
                        key={field.fieldname}
                        onClick={() => handleSort(field.fieldname)}
                        className="px-3 py-3 text-left text-xs font-medium text-zinc-500 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100 select-none"
                      >
                        {field.label || field.fieldname}
                        {SortIcon({ field: field.fieldname })}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
                  {rows.map((row, i) => (
                    <tr
                      key={i}
                      onClick={() => {
                        const name = String(row.name ?? "");
                        if (name) router.push(`/desk/doctype/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`);
                      }}
                      className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="px-3 py-3">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(String(row.name))}
                          onChange={(e) => {
                            const next = new Set(selectedRows);
                            const nameStr = String(row.name);
                            if (e.target.checked) {
                              next.add(nameStr);
                            } else {
                              next.delete(nameStr);
                            }
                            setSelectedRows(next);
                            e.stopPropagation();
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded border-zinc-300"
                        />
                      </td>
                      {listFields.map((field) => (
                        <td key={field.fieldname} className="px-3 py-3 text-zinc-700 dark:text-zinc-300">
                          {String(row[field.fieldname] ?? "-")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-zinc-200 px-4 py-3 dark:border-zinc-700">
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-500">Rows per page:</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(0);
                  }}
                  className="rounded-lg border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100"
                >
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-500">
                  Page {page + 1} of {totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className="rounded-lg border border-zinc-300 px-3 py-1 text-sm disabled:opacity-50 hover:bg-zinc-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1}
                  className="rounded-lg border border-zinc-300 px-3 py-1 text-sm disabled:opacity-50 hover:bg-zinc-50"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
