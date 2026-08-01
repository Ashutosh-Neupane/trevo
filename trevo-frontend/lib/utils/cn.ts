// Tailwind CSS class merge utility (shadcn standard).

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind CSS classes, resolving conflicts intelligently. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
