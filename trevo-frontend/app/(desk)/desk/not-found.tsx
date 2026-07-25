import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found — Trevo",
  description: "The page you're looking for doesn't exist.",
};

export default function NotFoundPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 p-8">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-zinc-300 dark:text-zinc-700">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Page Not Found
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          href="/desk"
          className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Go to Dashboard
        </Link>
        <Link
          href="/desk/doctype"
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Browse DocTypes
        </Link>
      </div>
    </div>
  );
}
