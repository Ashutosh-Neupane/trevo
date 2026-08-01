"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { frappeMethod } from "@/lib/frappe/client";
import { Card } from "@/components/shadcn/card";
import { Button } from "@/components/shadcn/button";
import { Input } from "@/components/shadcn/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/shadcn/dialog";
import {
  Folder,
  Image,
  FileText,
  FileSpreadsheet,
  Upload,
  Search,
  Trash2,
  Download,
  MoreHorizontal,
  Loader2,
  Grid3X3,
  List,
  ChevronRight,
  Home,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface FileDoc {
  name: string;
  file_name: string;
  file_url: string;
  file_size: number;
  file_type: string;
  folder: string;
  is_folder: number;
  modified: string;
  creation: string;
  owner: string;
}

interface FileBrowserProps {
  doctype?: string;
  docname?: string;
}

function getFileIcon(fileName: string, isFolder: boolean): React.ElementType {
  if (isFolder) return Folder;
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext)) return Image;
  if (ext === "pdf") return FileText;
  if (["xls", "xlsx", "csv"].includes(ext)) return FileSpreadsheet;
  if (["doc", "docx"].includes(ext)) return FileText;
  return FileText;
}

export function FileBrowser({ doctype, docname }: FileBrowserProps) {
  const [currentFolder, setCurrentFolder] = useState("Home");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [folderPath, setFolderPath] = useState<string[]>(["Home"]);

  const { data: files = [], isLoading, refetch } = useQuery({
    queryKey: ["files", currentFolder, doctype, docname],
    queryFn: async () => {
      const filters: Record<string, unknown> = { folder: currentFolder };
      if (doctype && docname) {
        filters.attached_to_doctype = doctype;
        filters.attached_to_name = docname;
      }
      const result = await frappeMethod<{ data: FileDoc[] }>("frappe.client.get_list", {
        doctype: "File",
        filters,
        fields: ["name", "file_name", "file_url", "file_size", "file_type", "folder", "is_folder", "modified", "creation", "owner"],
        order_by: "modified desc",
        limit: 200,
      });
      return result?.data ?? [];
    },
    staleTime: 30_000,
  });

  const deleteMutation = useMutation({
    mutationFn: async (name: string) => {
      return frappeMethod("frappe.client.delete", { doctype: "File", name });
    },
    onSuccess: () => refetch(),
  });

  const handleUpload = useCallback(async () => {
    if (!uploadFile) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("doctype", "File");
      formData.append("folder", currentFolder);
      if (doctype) formData.append("attached_to_doctype", doctype);
      if (docname) formData.append("attached_to_name", docname);

      await frappeMethod("frappe.client.upload_file", formData as unknown as Record<string, unknown>);
      setUploadFile(null);
      setUploadOpen(false);
      refetch();
    } finally {
      setUploading(false);
    }
  }, [uploadFile, currentFolder, doctype, docname, refetch]);

  const navigateToFolder = useCallback((folderName: string) => {
    setCurrentFolder(folderName);
    setFolderPath((prev) => [...prev, folderName]);
  }, []);

  const navigateHome = useCallback(() => {
    setCurrentFolder("Home");
    setFolderPath(["Home"]);
  }, []);

  const navigateToBreadcrumb = useCallback((index: number) => {
    const path = folderPath.slice(0, index + 1);
    setFolderPath(path);
    setCurrentFolder(path[path.length - 1]);
  }, [folderPath]);

  const filteredFiles = files.filter((f) =>
    !searchQuery || f.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const folders = filteredFiles.filter((f) => f.is_folder);
  const fileItems = filteredFiles.filter((f) => !f.is_folder);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={navigateHome}>
            <Home className="h-4 w-4" />
          </Button>
          <div className="flex items-center text-sm text-zinc-500">
            {folderPath.map((folder, i) => (
              <span key={i} className="flex items-center">
                {i > 0 && <ChevronRight className="mx-1 h-3 w-3" />}
                <button
                  onClick={() => navigateToBreadcrumb(i)}
                  className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  {folder}
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files..."
              className="h-8 w-48 pl-8 text-xs"
            />
          </div>

          <div className="flex rounded-lg border border-zinc-300 dark:border-zinc-700 overflow-hidden">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 ${viewMode === "list" ? "bg-zinc-100 dark:bg-zinc-700" : ""}`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 ${viewMode === "grid" ? "bg-zinc-100 dark:bg-zinc-700" : ""}`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
          </div>

          <Button size="sm" onClick={() => setUploadOpen(true)}>
            <Upload className="h-4 w-4 mr-1" />
            Upload
          </Button>
        </div>
      </div>

      {/* File list */}
      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-6 w-6 animate-spin text-zinc-400" />
        </div>
      ) : filteredFiles.length === 0 ? (
        <Card className="p-12 text-center">
          <Folder className="mx-auto h-8 w-8 text-zinc-300 dark:text-zinc-600" />
          <p className="mt-2 text-sm text-zinc-500">This folder is empty</p>
          <Button variant="outline" size="sm" onClick={() => setUploadOpen(true)} className="mt-2">
            <Upload className="h-4 w-4 mr-1" />
            Upload files
          </Button>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {folders.map((folder) => (
            <Card
              key={folder.name}
              className="p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigateToFolder(folder.file_name)}
            >
              <div className="flex flex-col items-center gap-2 text-center">
                <Folder className="h-8 w-8 text-blue-500" />
                <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate w-full">
                  {folder.file_name}
                </p>
              </div>
            </Card>
          ))}
          {fileItems.map((file) => {
            const Icon = getFileIcon(file.file_name, false);
            return (
              <a
                key={file.name}
                href={file.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <Icon className="h-8 w-8 text-zinc-500" />
                    <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300 truncate w-full">
                      {file.file_name}
                    </p>
                    <p className="text-[10px] text-zinc-400">{formatFileSize(file.file_size)}</p>
                  </div>
                </Card>
              </a>
            );
          })}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
                <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500">Size</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500">Modified</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-zinc-500">Owner</th>
                <th className="px-4 py-2 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {folders.map((folder) => (
                <tr
                  key={folder.name}
                  className="cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                  onClick={() => navigateToFolder(folder.file_name)}
                >
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4 text-blue-500" />
                      <span className="text-zinc-700 dark:text-zinc-300">{folder.file_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-zinc-500">—</td>
                  <td className="px-4 py-2 text-zinc-500">
                    {formatDistanceToNow(new Date(folder.modified), { addSuffix: true })}
                  </td>
                  <td className="px-4 py-2 text-zinc-500">{folder.owner}</td>
                  <td className="px-4 py-2">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                      <MoreHorizontal className="h-3 w-3" />
                    </Button>
                  </td>
                </tr>
              ))}
              {fileItems.map((file) => {
                const Icon = getFileIcon(file.file_name, false);
                return (
                  <tr key={file.name} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                    <td className="px-4 py-2">
                      <a
                        href={file.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <Icon className="h-4 w-4 text-zinc-500" />
                        <span className="text-zinc-700 dark:text-zinc-300">{file.file_name}</span>
                      </a>
                    </td>
                    <td className="px-4 py-2 text-zinc-500">{formatFileSize(file.file_size)}</td>
                    <td className="px-4 py-2 text-zinc-500">
                      {formatDistanceToNow(new Date(file.modified), { addSuffix: true })}
                    </td>
                    <td className="px-4 py-2 text-zinc-500">{file.owner}</td>
                    <td className="px-4 py-2">
                      <div className="flex gap-1">
                        <a href={file.file_url} download target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                            <Download className="h-3 w-3" />
                          </Button>
                        </a>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                          onClick={() => {
                            if (confirm(`Delete "${file.file_name}"?`)) {
                              deleteMutation.mutate(file.name);
                            }
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {/* Upload dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-zinc-500">
              Upload to folder: <strong>{currentFolder}</strong>
            </p>
            <input
              type="file"
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-zinc-600 file:mr-4 file:rounded-lg file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-800 dark:file:bg-zinc-100 dark:file:text-zinc-900 dark:hover:file:bg-zinc-200"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadOpen(false)} disabled={uploading}>
              Cancel
            </Button>
            <Button onClick={handleUpload} disabled={!uploadFile || uploading}>
              {uploading ? (
                <>
                  <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-1 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
