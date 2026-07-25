"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchWorkspaceSidebarClient, fetchWorkspaceDataClient } from "@/lib/frappe/workspace";
import type { WorkspaceSidebarItem, WorkspaceData } from "@/lib/frappe/types";

export function useWorkspaces() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: fetchWorkspaceSidebarClient,
    staleTime: 5 * 60 * 1000,
  });
}

export function useWorkspace(name: string) {
  return useQuery({
    queryKey: ["workspace", name],
    queryFn: () => fetchWorkspaceDataClient(name),
    staleTime: 5 * 60 * 1000,
    enabled: !!name,
  });
}
