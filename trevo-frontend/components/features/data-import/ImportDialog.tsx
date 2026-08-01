"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/shadcn/dialog";
import { Upload, Download, AlertTriangle, CheckCircle2, FileSpreadsheet } from "lucide-react";

interface ImportFieldMapping {
  fieldname: string;
  header: string;
  selected?: boolean;
}

interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctype: string;
  fieldMappings: ImportFieldMapping[];
  onImport: (file: File, options: ImportOptions) => Promise<ImportResult>;
}

export interface ImportOptions {
  insertAfterFailed?: boolean;
  ignoreEncodingErrors?: boolean;
  submitAfterImport?: boolean;
}

export interface ImportResult {
  imported: number;
  total: number;
  errors: Array<{ row: number; message: string }>;
}

export function ImportDialog({
  open,
  onOpenChange,
  doctype,
  fieldMappings,
  onImport,
}: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Array<Record<string, string>>>([]);
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    insertAfterFailed: false,
    ignoreEncodingErrors: false,
    submitAfterImport: false,
  });
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      setFile(selectedFile);
      setImportResult(null);

      // Try to parse CSV for preview
      try {
        const text = await selectedFile.text();
        const lines = text.split("\n").filter(Boolean);
        if (lines.length > 1) {
          const headers = lines[0].split(",").map((h) => h.trim());
          const previewRows = lines.slice(1, 6).map((line) => {
            const values = line.split(",").map((v) => v.trim());
            const row: Record<string, string> = {};
            headers.forEach((h, i) => {
              row[h] = values[i] ?? "";
            });
            return row;
          });
          setPreview(previewRows);
        }
      } catch {
        setPreview([]);
      }
    },
    [],
  );

  const handleImport = useCallback(async () => {
    if (!file) return;
    setImporting(true);
    try {
      const result = await onImport(file, importOptions);
      setImportResult(result);
    } catch {
      setImportResult({ imported: 0, total: 0, errors: [{ row: 0, message: "Import failed" }] });
    } finally {
      setImporting(false);
    }
  }, [file, importOptions, onImport]);

  const handleDownloadTemplate = useCallback(() => {
    const headers = fieldMappings.map((f) => f.header);
    const csvContent = "\uFEFF" + headers.join(",") + "\n";
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doctype}_import_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [fieldMappings, doctype]);

  const resetDialog = useCallback(() => {
    setFile(null);
    setPreview([]);
    setImportResult(null);
    setImportOptions({
      insertAfterFailed: false,
      ignoreEncodingErrors: false,
      submitAfterImport: false,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpen) => {
        if (!newOpen) resetDialog();
        onOpenChange(newOpen);
      }}
    >
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Import {doctype}</DialogTitle>
        </DialogHeader>

        {importResult ? (
          /* Import result view */
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border p-4 dark:border-zinc-700">
              {importResult.errors.length === 0 ? (
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              )}
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">
                  {importResult.imported === importResult.total
                    ? "Import completed successfully"
                    : `Imported ${importResult.imported} of ${importResult.total} records`}
                </p>
                {importResult.errors.length > 0 && (
                  <p className="text-sm text-zinc-500">
                    {importResult.errors.length} error{importResult.errors.length !== 1 ? "s" : ""} encountered
                  </p>
                )}
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="max-h-32 overflow-y-auto rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-900/20">
                {importResult.errors.map((err, i) => (
                  <p key={i} className="text-xs text-red-600 dark:text-red-400">
                    Row {err.row}: {err.message}
                  </p>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Import form */
          <div className="space-y-4">
            {/* Template download */}
            <div className="rounded-lg border border-dashed border-zinc-300 p-4 text-center dark:border-zinc-700">
              <FileSpreadsheet className="mx-auto h-8 w-8 text-zinc-400" />
              <p className="mt-2 text-sm text-zinc-500">
                Upload a CSV file to import records. The first row must contain column headers.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadTemplate}
                className="mt-2"
              >
                <Download className="mr-1 h-4 w-4" />
                Download Template
              </Button>
            </div>

            {/* File picker */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.tsv,.xls,.xlsx"
                onChange={handleFileChange}
                className="block w-full text-sm text-zinc-600 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-800 dark:file:bg-zinc-100 dark:file:text-zinc-900 dark:hover:file:bg-zinc-200"
              />
            </div>

            {/* CSV preview */}
            {preview.length > 0 && (
              <div>
                <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Preview (first {preview.length} rows)
                </label>
                <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-700">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-zinc-50 dark:bg-zinc-800">
                        {Object.keys(preview[0]).map((header) => (
                          <th
                            key={header}
                            className="border-b border-zinc-200 px-2 py-1.5 text-left font-medium text-zinc-600 dark:border-zinc-700 dark:text-zinc-400"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {preview.map((row, i) => (
                        <tr key={i} className="border-b border-zinc-100 dark:border-zinc-800">
                          {Object.values(row).map((val, j) => (
                            <td
                              key={j}
                              className="px-2 py-1 text-zinc-700 dark:text-zinc-300"
                            >
                              {val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Import options */}
            {file && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Import Options
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={importOptions.submitAfterImport}
                      onChange={(e) =>
                        setImportOptions({
                          ...importOptions,
                          submitAfterImport: e.target.checked,
                        })
                      }
                      className="rounded border-zinc-300"
                    />
                    <span className="text-zinc-600 dark:text-zinc-400">
                      Submit documents after import
                    </span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={importOptions.insertAfterFailed}
                      onChange={(e) =>
                        setImportOptions({
                          ...importOptions,
                          insertAfterFailed: e.target.checked,
                        })
                      }
                      className="rounded border-zinc-300"
                    />
                    <span className="text-zinc-600 dark:text-zinc-400">
                      Insert rows after failed rows
                    </span>
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={importOptions.ignoreEncodingErrors}
                      onChange={(e) =>
                        setImportOptions({
                          ...importOptions,
                          ignoreEncodingErrors: e.target.checked,
                        })
                      }
                      className="rounded border-zinc-300"
                    />
                    <span className="text-zinc-600 dark:text-zinc-400">
                      Ignore encoding errors
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {importResult ? (
            <Button onClick={() => onOpenChange(false)}>Close</Button>
          ) : (
            <>
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={importing}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={!file || importing}>
                {importing ? "Importing..." : (
                  <>
                    <Upload className="mr-1 h-4 w-4" />
                    Start Import
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
