"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/stores/auth.store";
import { clientBoot } from "@/lib/frappe/client";
import type { BootInfo } from "@/lib/frappe/types";

/** Fetch boot info from our BFF (assembles multiple Frappe calls since get_bootinfo isn't whitelisted). */
export function useBootInfo() {
  const setBootInfo = useAuthStore((s) => s.setBootInfo);

  return useQuery({
    queryKey: ["boot"],
    queryFn: async () => {
      const info = (await clientBoot()) as BootInfo | null;
      if (info) setBootInfo(info);
      return info;
    },
    staleTime: 10 * 60 * 1000, // 10 min
    retry: false,
  });
}
