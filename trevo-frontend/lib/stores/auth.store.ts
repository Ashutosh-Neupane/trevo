/**
 * Auth store — Zustand.
 * Tracks user session state across the desk.
 */
import { create } from "zustand";
import type { FrappeUser, BootInfo } from "@/lib/frappe/types";

interface AuthState {
  /** Current user (null = not logged in) */
  user: FrappeUser | null;
  /** Boot info (assembled by BFF) */
  bootInfo: BootInfo | null;
  /** Whether boot info has been fetched at least once */
  bootLoaded: boolean;

  setUser: (user: FrappeUser | null) => void;
  setBootInfo: (info: BootInfo) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  bootInfo: null,
  bootLoaded: false,

  setUser: (user) => set({ user }),

  setBootInfo: (info) => set({ bootInfo: info, bootLoaded: true, user: info.user }),

  logout: () => set({ user: null, bootInfo: null, bootLoaded: false }),
}));
