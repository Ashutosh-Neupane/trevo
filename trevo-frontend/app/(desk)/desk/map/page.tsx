"use client";

import { MapView } from "@/components/features/map";

export default function MapPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Map View</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          View records on a map
        </p>
      </div>
      <MapView doctype="Customer" />
    </div>
  );
}
