/**
 * UI store — Zustand.
 * Sidebar, theme, and general UI state.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  sidebarOpen: boolean;
  theme: "light" | "dark" | "system";
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: "light",

      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setTheme: (theme) => {
        // Apply immediately to <html> data-theme attribute
        if (typeof document !== "undefined") {
          const root = document.documentElement;
          if (theme === "system") {
            const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            root.setAttribute("data-theme", prefersDark ? "dark" : "light");
          } else {
            root.setAttribute("data-theme", theme);
          }
        }
        set({ theme });
      },
    }),
    { name: "trevo-ui", partialize: (s) => ({ theme: s.theme }) },
  ),
);
