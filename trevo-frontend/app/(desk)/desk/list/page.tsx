import Link from "next/link";

export default function ListPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-zinc-900">List</h1>
      <div className="rounded border bg-white p-4">
        <p className="text-sm text-zinc-600">
          Browse records across DocTypes. Select a DocType below to view its list view.
        </p>
        <div className="mt-4">
          <Link href="/desk/doctype" className="text-sm text-blue-600 hover:underline">
            Browse DocTypes
          </Link>
        </div>
      </div>
    </div>
  );
}
