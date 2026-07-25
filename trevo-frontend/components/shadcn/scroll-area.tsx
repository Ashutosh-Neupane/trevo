"use client";

import * as React from "react";

export function ScrollArea({ className = "", children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      <div className="h-full w-full overflow-y-auto">{children}</div>
    </div>
  );
}
