import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { isAdmin } from "@/lib/data";

/** Role-gated shell. The proxy ensures auth; this enforces the admin role. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/dashboard");

  return (
    <div className="flex min-h-svh">
      <AdminSidebar />
      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
