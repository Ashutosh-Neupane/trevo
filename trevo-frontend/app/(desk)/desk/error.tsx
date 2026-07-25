"use client";

import { Metadata } from "next";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Error — Trevo",
  description: "An error occurred.",
};

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-300 dark:text-red-700">500</h1>
        <h2 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Server Error
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Something went wrong on our end. Please try again.
        </p>
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 text-left">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-red-600 hover:text-red-700"
            >
              {showDetails ? "Hide" : "Show"} error details
            </button>
            {showDetails && (
              <pre className="mt-2 overflow-x-auto rounded-lg bg-zinc-100 p-4 text-xs text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                {error.message}
              </pre>
            )}
          </div>
        )}
      </div>

      <button
        onClick={reset}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
      >
        Try again
      </button>
      {/* Trevo error boundary */}
    </div>
  );
}
