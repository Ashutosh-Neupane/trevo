"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Search, Download, Upload } from "lucide-react";
import { useDoctype } from "@/lib/hooks/useDoctype";
import { useList } from "@/lib/hooks/useList";
import { useListCount } from "@/lib/hooks/useList";
import { useSaveDocument, useCancelDocument, useDiscardDocument } from "@/lib/hooks/useDocument";
import type { FilterOperator } from "@/lib/frappe/types";
import { Badge } from "@/components/shadcn/badge";
import { Button } from "@/components/shadcn/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/shadcn/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/shadcn/dialog";
import { TableSkeleton } from "@/components/Skeleton";
import ListFilters from "@/components/ListFilters";
import type { FilterDef } from "@/components/ListFilters";
import { exportToCSV, exportToJSON } from "@/lib/frappe/export";
import { importCsvToDocType } from "@/lib/frappe/import";

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

export default function DoctypeListView() {
  const params = useParams<{ doctype: string }>();
  const router = useRouter();
  const doctype = decodeURIComponent(params.doctype);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState<string>("modified");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterState, setFilterState] = useState<Record<string, { value: string; operator: FilterOperator; valueTo?: string }>>({});
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [exportOpen, setExportOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const { data: meta } = useDoctype(doctype);
  const isSubmittable = !!meta?.is_submittable;

  const listFields = useMemo(() => {
    const fields = meta?.fields;
    if (!fields) return [];
    return fields.filter((f) => f.in_list_view && !["Section Break", "Column Break", "Tab Break", "Heading"].includes(f.fieldtype));
  }, [meta?.fields]);

  const availableFilters: FilterDef[] = useMemo(() => {
    return listFields
      .filter((f) => ["Select", "Autocomplete", "Date", "Datetime", "Int", "Float", "Currency"].includes(f.fieldtype))
      .map((f) => {
        const type = f.fieldtype === "Date" || f.fieldtype === "Datetime" ? "date" : f.fieldtype === "Int" || f.fieldtype === "Float" || f.fieldtype === "Currency" ? "number" : f.fieldtype === "Select" || f.fieldtype === "Autocomplete" ? "select" : "text";
        const operators: FilterOperator[] =
          type === "date" ? ["=", "!=", ">", "<", ">=", "<=", "Between"] :
          type === "number" ? ["=", "!=", ">", "<", ">=", "<=", "Between"] :
          type === "select" ? ["=", "!=", "like", "not like"] :
          ["like", "=", "!=", "is"];
        return {
          fieldname: f.fieldname,
          label: f.label || f.fieldname,
          type,
          options: f.fieldtype === "Select" || f.fieldtype === "Autocomplete" ? (f.options || "").split("\n").map((o) => ({ value: o, label: o })).filter(Boolean) : undefined,
          operators,
        };
      });
  }, [listFields]);

  const filters = useMemo(() => {
    return Object.entries(filterState)
      .filter(([, f]) => {
        if (!f.value && !f.valueTo) return false;
        if (f.operator === "Between" && (!f.value || !f.valueTo)) return false;
        return true;
      })
      .map(([fieldname, { value, operator, valueTo }]) => {
        const field = listFields.find((f) => f.fieldname === fieldname);
        const isDate = field?.fieldtype === "Date" || field?.fieldtype === "Datetime";
        let v: unknown = value;
        if (operator === "Between") {
          v = [value, valueTo || ""];
        } else if (!isDate) {
          if (operator === "like") v = `%${value}%`;
          else if (operator === "not like") v = `%${value}%`;
        }
        return [doctype, fieldname, operator, v] as [string, string, FilterOperator, unknown];
      });
  }, [filterState, listFields, doctype]);

  const handleFiltersChange = (newFilters: Record<string, { value: string; operator: FilterOperator; valueTo?: string }>) => {
    setFilterState(newFilters);
    setPage(0);
  };

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

  const saveMutation = useSaveDocument(doctype);
  const cancelMutation = useCancelDocument(doctype);
  const discardMutation = useDiscardDocument(doctype);

  const handleBulkSubmit = async () => {
    for (const name of selectedRows) {
      try {
        await saveMutation.mutateAsync({ doc: { doctype, name }, action: "Submit" });
      } catch {
        // continue on failure
      }
    }
    setSelectedRows(new Set());
    refetch();
  };

  const handleBulkCancel = async () => {
    for (const name of selectedRows) {
      try {
        await cancelMutation.mutateAsync(name);
      } catch {
        // continue on failure
      }
    }
    setSelectedRows(new Set());
    refetch();
  };

  const handleBulkDiscard = async () => {
    for (const name of selectedRows) {
      try {
        await discardMutation.mutateAsync(name);
      } catch {
        // continue on failure
      }
    }
    setSelectedRows(new Set());
    refetch();
  };

  const handleExportCSV = () => {
    const cols = listFields.map((f) => ({ fieldname: f.fieldname, label: f.label || undefined }));
    exportToCSV(rows, cols, `${doctype}_export.csv`);
  };

  const handleExportJSON = () => {
    exportToJSON(rows, `${doctype}_export.json`);
  };

  const handleImport = async () => {
    if (!importFile) return;
    setImporting(true);
    try {
      const fieldMap = listFields.map((f) => ({ fieldname: f.fieldname, header: f.label || f.fieldname }));
      const result = await importCsvToDocType(importFile, doctype, fieldMap);
      alert(`Imported ${result.imported} of ${result.total} records`);
      if (result.errors.length > 0) {
        console.error("Import errors:", result.errors);
      }
      setImportFile(null);
      setImportOpen(false);
      refetch();
    } catch {
      alert("Import failed");
    } finally {
      setImporting(false);
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? " ↑" : " ↓";
  };

  const renderCell = (row: Record<string, unknown>, field: { fieldname: string; label?: string; fieldtype: string }) => {
    const value = row[field.fieldname];
    if (field.fieldname === "docstatus" && typeof value === "number") {
      const statuses: Record<number, { label: string; variant: "default" | "secondary" | "destructive" }> = {
        0: { label: "Draft", variant: "secondary" },
        1: { label: "Submitted", variant: "default" },
        2: { label: "Cancelled", variant: "destructive" },
      };
      const s = statuses[value] ?? { label: "Unknown", variant: "secondary" };
      return <Badge variant={s.variant}>{s.label}</Badge>;
    }
    return String(value ?? "-");
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

          <ListFilters filters={filterState} onFiltersChange={handleFiltersChange} availableFilters={availableFilters} />

          <DropdownMenu open={exportOpen} onOpenChange={setExportOpen}>
            <DropdownMenuTrigger>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleExportCSV}>
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportJSON}>
                Export JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Dialog open={importOpen} onOpenChange={setImportOpen}>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setImportOpen(true)}>
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import CSV</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-sm text-zinc-500">
                  Upload a CSV file to import records. The first row must contain column headers that match field names.
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-zinc-600 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-800"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setImportOpen(false)} disabled={importing}>
                  Cancel
                </Button>
                <Button onClick={handleImport} disabled={!importFile || importing}>
                  {importing ? "Importing..." : "Import"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Link
            href={`/desk/doctype/${encodeURIComponent(doctype)}/new`}
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-800"
          >
            New
          </Link>
        </div>
      </div>

      {/* Data table */}
      <div className="rounded-xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-700 dark:bg-zinc-800 overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={pageSize} cols={listFields.length + 1} />
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
                  {isSubmittable && (
                    <>
                      <button
                        onClick={handleBulkSubmit}
                        className="rounded-lg bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700"
                      >
                        Submit
                      </button>
                      <button
                        onClick={handleBulkCancel}
                        className="rounded-lg border border-yellow-600 px-3 py-1 text-sm font-medium text-yellow-700 hover:bg-yellow-50"
                      >
                        Cancel
                      </button>
                    </>
                  )}
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
                           {renderCell(row, field as { fieldname: string; label?: string; fieldtype: string })}
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
