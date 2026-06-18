"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Cpu, Users, Gift, ArrowLeft, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const adminNav = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Machines", href: "/admin/machines", icon: Cpu },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Rewards", href: "/admin/rewards", icon: Gift },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="glass sticky top-0 hidden h-svh w-64 shrink-0 flex-col gap-1 rounded-none border-y-0 border-l-0 p-4 lg:flex">
      <div className="flex items-center gap-2.5 px-2 py-4">
        <div className="grid size-8 place-items-center rounded-lg bg-info/15 text-info">
          <ShieldCheck className="size-5" />
        </div>
        <span className="text-lg font-semibold tracking-tight">Admin</span>
      </div>

      <nav className="mt-2 flex flex-col gap-1">
        {adminNav.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
                active ? "bg-info/10 text-ink" : "text-ink-muted hover:bg-surface/70 hover:text-ink",
              )}
            >
              <item.icon
                className={cn(
                  "size-[18px]",
                  active ? "text-info" : "text-ink-faint group-hover:text-ink-muted",
                )}
              />
              {item.label}
              {active && <span className="ml-auto size-1.5 rounded-full bg-info" />}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/dashboard"
        className="mt-auto flex items-center gap-2 rounded-xl border border-line/70 bg-surface/40 px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Back to app
      </Link>
    </aside>
  );
}
