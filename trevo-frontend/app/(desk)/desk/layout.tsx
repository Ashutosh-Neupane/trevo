import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import TrevoShell from "@/components/TrevoShell";

export default async function DeskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieJar = await cookies();
  const sid = cookieJar.get("sid")?.value;

  if (!sid || sid === "Guest") {
    redirect("/login");
  }

  return <TrevoShell>{children}</TrevoShell>;
}
