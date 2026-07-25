"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/frappe/auth";
import { useUIStore } from "@/lib/stores/ui.store";
import { useWorkspaces } from "@/lib/hooks/useWorkspaces";
import CommandPalette from "@/components/CommandPalette";
import NotificationsPanel from "@/components/NotificationsPanel";
import {
  Moon,
  Sun,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  Home,
  FileText,
  Layout,
  BarChart3,
  Settings,
  Calendar,
  Plus,
} from "lucide-react";

function NavItem({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      className={[
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
          : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
      ].join(" ")}
      href={href}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

export default function TrevoShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { sidebarOpen, toggleSidebar, theme, setTheme } = useUIStore();
  const [, setCommandOpen] = useState(false);
  const { data: workspaces } = useWorkspaces();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navItems = [
    { href: "/desk", label: "Dashboard", icon: Home },
    { href: "/desk/doctype", label: "DocTypes", icon: FileText },
    { href: "/desk/forms", label: "New", icon: Plus },
    { href: "/desk/reports", label: "Reports", icon: BarChart3 },
    { href: "/desk/calendar", label: "Calendar", icon: Calendar },
    { href: "/desk/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="sticky top-0 z-40 h-14 border-b border-zinc-200 bg-white/80 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="flex h-full items-center justify-between px-4">
          {/* Left section */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {sidebarOpen ? (
                <PanelLeftClose className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
              ) : (
                <PanelLeftOpen className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
              )}
            </button>

            <Link href="/desk" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100">
                <Layout className="h-5 w-5 text-white dark:text-zinc-900" />
              </div>
              <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Trevo</span>
            </Link>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            {/* Command palette trigger */}
            <CommandPalette />

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              ) : (
                <Moon className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              )}
            </button>

            {/* Notifications */}
            <NotificationsPanel />

            {/* User menu */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                  {user?.name || user?.full_name || "User"}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {user?.email}
                </div>
              </div>
              <button
                onClick={logout}
                className="rounded-lg p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={[
            "fixed inset-y-0 left-0 z-30 mt-14 border-r border-zinc-200 bg-white transition-all duration-300 ease-in-out dark:border-zinc-800 dark:bg-zinc-900",
            sidebarOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full overflow-hidden",
          ].join(" ")}
        >
          <div className="flex h-full flex-col overflow-y-auto p-3">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <NavItem
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                />
              ))}
            </nav>

            {workspaces && workspaces.length > 0 && (
              <>
                <div className="my-3 border-t border-zinc-200 dark:border-zinc-800" />
                <div className="mb-2 px-3 text-xs font-medium text-zinc-500 dark:text-zinc-400">Workspaces</div>
                <nav className="flex flex-col gap-1">
                  {workspaces.map((ws) => (
                    <Link
                      key={ws.name}
                      href={`/desk/workspace/${encodeURIComponent(ws.name)}`}
                      className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                    >
                      {ws.title}
                    </Link>
                  ))}
                </nav>
              </>
            )}
          </div>
        </aside>

        {/* Main content */}
        <main
          className={[
            "flex-1 p-4 transition-all duration-300 ease-in-out",
            sidebarOpen ? "md:ml-64" : "md:ml-0",
          ].join(" ")}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
