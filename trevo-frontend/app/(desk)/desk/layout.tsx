import { redirect } from "next/navigation";
import TrevoShell from "@/components/TrevoShell";

export default async function DeskLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/auth/whoami`, {
      cache: "no-store",
    });
    const data = await res.json();
    if (!data.user || data.user === "Guest") {
      redirect("/login");
    }
  } catch {
    redirect("/login");
  }

  return <TrevoShell>{children}</TrevoShell>;
}
