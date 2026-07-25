"use client";

import * as React from "react";

export function Slot({ children, ...props }: { children?: React.ReactNode } & React.HTMLAttributes<HTMLSpanElement>) {
  if (React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, props);
  }
  return <span {...props}>{children}</span>;
}
