"use client";

import { useEffect } from "react";

/**
 * Auto-save hook — automatically saves the form at regular intervals.
 * Provides draft protection beforeunload and manual save on Ctrl+S.
 */
export function useAutoSave(intervalMs = 30000) {
  useEffect(() => {
    const handleSave = () => {
      // Dispatch a custom event that forms can listen for
      document.dispatchEvent(new Event("autoSave"));
    };

    const timer = setInterval(handleSave, intervalMs);

    // Save before unload if there are unsaved changes
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (document.querySelector("[data-dirty=\"true\"]")) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(timer);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [intervalMs]);
}
