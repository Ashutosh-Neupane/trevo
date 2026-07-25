"use client";

import * as React from "react";

const TooltipContext = React.createContext<{ open: boolean } | null>(null);

export function Tooltip({ open, children, content, side = "top" }: { open?: boolean; children: React.ReactNode; content: React.ReactNode; side?: "top" | "bottom" | "left" | "right" }) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isOpen = open ?? internalOpen;

  const sideClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <TooltipContext.Provider value={{ open: isOpen }}>
      <div className="relative inline-block" onMouseEnter={() => setInternalOpen(true)} onMouseLeave={() => setInternalOpen(false)}>
        {children}
        {isOpen && (
          <div className={`absolute z-50 whitespace-nowrap rounded-lg bg-zinc-900 px-3 py-1.5 text-xs text-white dark:bg-zinc-100 dark:text-zinc-900 ${sideClasses[side]}`}>
            {content}
          </div>
        )}
      </div>
    </TooltipContext.Provider>
  );
}
