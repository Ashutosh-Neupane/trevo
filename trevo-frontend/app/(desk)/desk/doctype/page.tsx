import Link from "next/link";
import { frappeServerFetch, getCookieHeader } from "@/lib/frappe/server";

async function getDoctypes() {
  const cookie = await getCookieHeader();
  const { data } = await frappeServerFetch<{ data: Array<{ name: string; module?: string }> }>(
    cookie,
    "api/resource/DocType",
    {
      params: {
        fields: JSON.stringify(["name", "module", "istable", "issingle"]),
        filters: JSON.stringify([["istable", "=", 0], ["issingle", "=", 0]]),
        order_by: "name asc",
        limit_page_length: 200,
      },
    },
  );
  return (data as unknown as Array<{ name: string; module?: string }>) ?? [];
}

export default async function DoctypesPage() {
  const doctypes = await getDoctypes();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-zinc-900">DocTypes</h1>
      <div className="rounded border bg-white">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b bg-zinc-50 text-left">
              <th className="px-4 py-2 font-medium text-zinc-600">Name</th>
              <th className="px-4 py-2 font-medium text-zinc-600">Module</th>
              <th className="px-4 py-2 font-medium text-zinc-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {doctypes.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-zinc-500">
                  No DocTypes found
                </td>
              </tr>
            ) : (
              doctypes.map((dt) => (
                <tr key={dt.name} className="border-b last:border-0 hover:bg-zinc-50">
                  <td className="px-4 py-2 text-zinc-900">{dt.name}</td>
                  <td className="px-4 py-2 text-zinc-600">{dt.module || "-"}</td>
                  <td className="px-4 py-2">
                    <Link
                      href={`/desk/doctype/${encodeURIComponent(dt.name)}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
