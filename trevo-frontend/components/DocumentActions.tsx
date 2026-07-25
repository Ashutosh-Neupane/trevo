"use client";

import { useState } from "react";
import { frappeMethod } from "@/lib/frappe/client";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/shadcn/dropdown-menu";
import { MoreVertical, Printer, Mail, Share2, Trash2 } from "lucide-react";

type DocRow = Record<string, unknown>;

interface DocumentActionsProps {
  doctype: string;
  name: string;
  onDeleted?: () => void;
}

export default function DocumentActions({ doctype, name, onDeleted }: DocumentActionsProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handlePrint = async () => {
    const format = "PDF";
    const data = await frappeMethod<{ file_url?: string }>("frappe.utils.print_format.download_pdf", { doctype, name, format });
    if (data?.file_url) {
      window.open(data.file_url, "_blank");
    }
  };

  const handleEmail = async () => {
    const data = await frappeMethod<DocRow[]>("frappe.desk.form.load.get_attachments", { doctype, name });
    const attachment = data?.find((a: DocRow) => typeof a.file_name === "string" && a.file_name.endsWith(".pdf"));
    if (attachment?.file_url) {
      window.open(`mailto:?subject=${encodeURIComponent(name)}&body=${encodeURIComponent(attachment.file_url as string)}`);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/desk/doctype/${encodeURIComponent(doctype)}/${encodeURIComponent(name)}`;
    await navigator.clipboard.writeText(url);
    alert("Link copied to clipboard");
  };

  const handleDelete = async () => {
    await frappeMethod("frappe.client.delete", { doctype, name });
    onDeleted?.();
  };

  return (
    <DropdownMenu open={deleteOpen} onOpenChange={setDeleteOpen}>
      <DropdownMenuTrigger>
        <button className="rounded-lg border border-zinc-300 p-2 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800">
          <MoreVertical className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handlePrint}>
          <Printer className="h-4 w-4" />
          Print
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleEmail}>
          <Mail className="h-4 w-4" />
          Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleShare}>
          <Share2 className="h-4 w-4" />
          Share
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
          <Trash2 className="h-4 w-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
