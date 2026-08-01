"use client";

import { useAuth } from "@/lib/frappe/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";


export function useKeyboardShortcuts() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;

      // Ctrl/Cmd + K — Command palette
      if (isMeta && e.key === "k") {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent("openCommandPalette"));
        return;
      }

      // Ctrl/Cmd + N — New document
      if (isMeta && e.key === "n") {
        e.preventDefault();
        router.push("/desk/doctype");
        return;
      }

      // Ctrl/Cmd + S — Save (let form handlers deal with it)
      if (isMeta && e.key === "s") {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent("saveRequested"));
        return;
      }

      // Ctrl/Cmd + Z — Undo
      if (isMeta && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent("undoRequested"));
        return;
      }

      // Ctrl/Cmd + Shift + Z — Redo
      if (isMeta && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent("redoRequested"));
        return;
      }

      // Escape — Close modals
      if (e.key === "Escape") {
        document.dispatchEvent(new CustomEvent("escapePressed"));
        return;
      }

      // ? — Show shortcuts help
      if (e.key === "?" && !isMeta && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable) {
          return;
        }
        document.dispatchEvent(new CustomEvent("showShortcutsHelp"));
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [user, router]);
}
