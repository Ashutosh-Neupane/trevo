"use client";

import { InboxView } from "@/components/features/inbox";

export default function InboxPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Inbox</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Communications and email
        </p>
      </div>
      <InboxView />
    </div>
  );
}
