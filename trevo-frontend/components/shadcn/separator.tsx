"use client";

import * as React from "react";

export function Separator({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="separator"
      className={`shrink-0 bg-zinc-200 dark:bg-zinc-800 ${className}`}
      {...props}
    />
  );
}
