import * as React from "react";

export function Button({
  className = "",
  variant = "default",
  size = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}) {
  const base =
    "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/20 disabled:pointer-events-none disabled:opacity-50";
  const variants = {
    default: "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200",
    destructive: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-zinc-300 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:bg-zinc-700",
    secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700",
    ghost: "hover:bg-zinc-100 dark:hover:bg-zinc-800",
    link: "text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100",
  };
  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-lg px-3",
    lg: "h-11 rounded-lg px-8",
    icon: "h-10 w-10",
  };

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props} />
  );
}
