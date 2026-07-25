"use client";

import { useEffect } from "react";

export function useKeyboardShortcut(key: string, callback: () => void, options: { ctrl?: boolean; shift?: boolean; alt?: boolean; meta?: boolean } = {}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const ctrl = options.ctrl ?? e.ctrlKey;
      const shift = options.shift ?? e.shiftKey;
      const alt = options.alt ?? e.altKey;
      const meta = options.meta ?? e.metaKey;

      if (e.key === key && e.ctrlKey === ctrl && e.shiftKey === shift && e.altKey === alt && e.metaKey === meta) {
        e.preventDefault();
        callback();
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [key, callback, options.ctrl, options.shift, options.alt, options.meta]);
}
