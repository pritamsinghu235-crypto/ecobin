import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { createClient } from "@/lib/supabase/server";

/** Shared shell for all authenticated citizen-facing pages. */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Defense in depth — the proxy already gates these routes.
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .single();

  const name =
    (profile as { full_name?: string } | null)?.full_name ??
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Citizen";
  const admin = (profile as { role?: string } | null)?.role === "admin";

  return (
    <div className="flex min-h-svh">
      <Sidebar user={{ name, email: user.email ?? "" }} isAdmin={admin} />
      <MobileNav variant="app" isAdmin={admin} user={{ name, email: user.email ?? "" }} />
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
