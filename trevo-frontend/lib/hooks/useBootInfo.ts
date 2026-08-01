"use client";

import { useAuthStore } from "@/lib/stores/auth.store";

type BootInfoLite = {
  user: FrappeUser | null;
  installed_apps: InstalledApp[];
  sysdefaults: Record<string, string>;
  lang: string;
  desk_theme?: "Light" | "Dark" | "System";
  notification_count: number;
};

import type { FrappeUser, InstalledApp } from "@/lib/frappe/types";

const emptyBootInfo: BootInfoLite = {
  user: null,
  installed_apps: [],
  sysdefaults: {},
  lang: "en",
  desk_theme: "Light",
  notification_count: 0,
};

export function useBootInfo() {
  const bootInfo = useAuthStore((s) => s.bootInfo);
  const bootLoaded = useAuthStore((s) => s.bootLoaded);

  return {
    data: bootInfo ?? emptyBootInfo,
    isLoading: !bootLoaded,
    isError: false,
    refetch: () => {},
  };
}
