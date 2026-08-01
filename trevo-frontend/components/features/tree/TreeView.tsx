"use client";

import { useState, useMemo } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen, File } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/shadcn/card";

interface TreeNode {
  id: string;
  parentId: string | null;
  isGroup: boolean;
}

interface TreeViewProps {
  doctype: string;
  onNodeClick?: (nodeId: string) => void;
}

export function TreeView({ doctype, onNodeClick }: TreeViewProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const { data, isLoading, error } = useQuery({
    queryKey: ["tree", doctype],
    queryFn: async () => {
      const res = await fetch(`/api/doctype/${encodeURIComponent(doctype)}/tree`);
      if (!res.ok) throw new Error("Failed to fetch tree data");
      return res.json() as Promise<{ nodes: TreeNode[] }>;
    },
  });

  const nodes = useMemo(() => data?.nodes ?? [], [data?.nodes]);

  const treeData = useMemo(() => {
    const map = new Map<string, TreeNode[]>();
    const roots: TreeNode[] = [];

    for (const node of nodes) {
      if (node.parentId && map.has(node.parentId)) {
        map.get(node.parentId)!.push(node);
      } else {
        roots.push(node);
      }
      if (node.isGroup) {
        map.set(node.id, []);
      }
    }

    return { roots, map };
  }, [nodes]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const renderNode = (node: TreeNode, level = 0) => {
    const children = treeData.map.get(node.id) ?? [];
    const isExpanded = expandedIds.has(node.id);
    const hasChildren = children.length > 0;

    return (
      <div key={node.id}>
      <div
        className={`flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer ${
          level === 0 ? "mt-1" : "ml-4"
        }`}
        role="button"
        tabIndex={0}
        onClick={() => {
          if (hasChildren) toggleExpand(node.id);
          onNodeClick?.(node.id);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (hasChildren) toggleExpand(node.id);
            onNodeClick?.(node.id);
          }
        }}
      >
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
              className="h-4 w-4 flex items-center justify-center"
            >
              {isExpanded ? <ChevronDown className="h-3 w-3 text-zinc-500" /> : <ChevronRight className="h-3 w-3 text-zinc-500" />}
            </button>
          ) : (
            <span className="h-4 w-4" />
          )}
          {node.isGroup ? (
            isExpanded ? <FolderOpen className="h-4 w-4 text-zinc-500" /> : <Folder className="h-4 w-4 text-zinc-500" />
          ) : (
            <File className="h-4 w-4 text-zinc-400" />
          )}
          <span className="text-sm text-zinc-700 dark:text-zinc-300">{node.id}</span>
        </div>
        {isExpanded && hasChildren && (
          <div>
            {children.map((child) => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-full rounded bg-zinc-100 dark:bg-zinc-700" />
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-sm text-red-600">
        Failed to load tree: {error instanceof Error ? error.message : "Unknown error"}
      </Card>
    );
  }

  if (nodes.length === 0) {
    return (
      <Card className="p-6 text-sm text-zinc-500">
        No tree nodes found. This doctype may not have tree structure enabled.
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="space-y-1">
        {treeData.roots.map((node) => renderNode(node))}
      </div>
    </Card>
  );
}
