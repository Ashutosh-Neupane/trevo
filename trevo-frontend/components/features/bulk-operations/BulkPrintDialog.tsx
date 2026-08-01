"use client";

import { useState } from "react";
import { Button } from "@/components/shadcn/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/shadcn/dialog";

interface BulkPrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  doctype: string;
  docnames: string[];
  printFormats?: string[];
  letterheads?: string[];
}

export function BulkPrintDialog({
  open,
  onOpenChange,
  doctype,
  docnames,
  printFormats = [],
  letterheads = [],
}: BulkPrintDialogProps) {
  const [selectedFormat, setSelectedFormat] = useState<string>(
    printFormats[0] ?? "Standard",
  );
  const [selectedLetterhead, setSelectedLetterhead] = useState<string>(
    letterheads[0] ?? "No Letterhead",
  );
  const [isBackground, setIsBackground] = useState(docnames.length > 25);

  const handlePrint = () => {
    const names = JSON.stringify(docnames);
    const params = new URLSearchParams({
      doctype,
      name: names,
      format: selectedFormat,
      no_letterhead: selectedLetterhead === "No Letterhead" ? "1" : "0",
      letterhead: selectedLetterhead,
    });

    if (isBackground && docnames.length > 25) {
      // Background print for large batches
      fetch(`/api/method/frappe.utils.print_format.download_multi_pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctype,
          name: names,
          format: selectedFormat,
          no_letterhead: selectedLetterhead === "No Letterhead" ? "0" : "1",
          letterhead: selectedLetterhead,
        }),
      }).then(() => {
        onOpenChange(false);
      });
    } else {
      // Direct print
      const url = `/api/method/frappe.utils.print_format.download_multi_pdf?${params.toString()}`;
      window.open(url, "_blank");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Print — {docnames.length} {docnames.length === 1 ? "document" : "documents"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Print Format */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Print Format
            </label>
            <select
              value={selectedFormat}
              onChange={(e) => setSelectedFormat(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              {printFormats.length > 0 ? (
                printFormats.map((fmt) => (
                  <option key={fmt} value={fmt}>
                    {fmt}
                  </option>
                ))
              ) : (
                <option value="Standard">Standard</option>
              )}
            </select>
          </div>

          {/* Letter Head */}
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Letter Head
            </label>
            <select
              value={selectedLetterhead}
              onChange={(e) => setSelectedLetterhead(e.target.value)}
              className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
            >
              {letterheads.length > 0 ? (
                letterheads.map((lh) => (
                  <option key={lh} value={lh}>
                    {lh}
                  </option>
                ))
              ) : (
                <option value="No Letterhead">No Letterhead</option>
              )}
            </select>
          </div>

          {/* Background Print option */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="background-print"
              checked={isBackground}
              onChange={(e) => setIsBackground(e.target.checked)}
              disabled={docnames.length <= 25}
              className="rounded border-zinc-300"
            />
            <label htmlFor="background-print" className="text-sm text-zinc-600 dark:text-zinc-400">
              Background Print (recommended for {'>'}25 documents)
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handlePrint}>
            Print {docnames.length} {docnames.length === 1 ? "document" : "documents"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

