/**
 * Desk store — Zustand.
 * Tracks active workspace, recent docs, and navigation state.
 */
import { create } from "zustand";

export interface RecentDoc {
  doctype: string;
  name: string;
  title?: string;
}

interface DeskState {
  activeWorkspace: string | null;
  recentDocs: RecentDoc[];
  setActiveWorkspace: (name: string | null) => void;
  addRecentDoc: (doc: RecentDoc) => void;
}

export const useDeskStore = create<DeskState>((set) => ({
  activeWorkspace: null,
  recentDocs: [],

  setActiveWorkspace: (name) => set({ activeWorkspace: name }),

  addRecentDoc: (doc) =>
    set((s) => {
      // Remove duplicate if exists, then prepend
      const filtered = s.recentDocs.filter(
        (r) => !(r.doctype === doc.doctype && r.name === doc.name),
      );
      return { recentDocs: [doc, ...filtered].slice(0, 20) };
    }),
}));
