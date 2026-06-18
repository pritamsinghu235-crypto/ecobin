"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ShieldCheck } from "lucide-react";
import { Wordmark } from "@/components/brand";
import { userNav } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { logout } from "@/app/(auth)/actions";

export function Sidebar({
  user,
  isAdmin = false,
}: {
  user: { name: string; email: string };
  isAdmin?: boolean;
}) {
  const pathname = usePathname();

  return (
    <aside className="glass sticky top-0 hidden h-svh w-64 shrink-0 flex-col gap-1 rounded-none border-y-0 border-l-0 p-4 lg:flex">
      <div className="px-2 py-4">
        <Link href="/dashboard">
          <Wordmark />
        </Link>
      </div>

      <nav className="mt-2 flex flex-col gap-1">
        {userNav.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300",
                active
                  ? "bg-brand-dim/50 text-ink"
                  : "text-ink-muted hover:bg-surface/70 hover:text-ink",
              )}
            >
              <item.icon
                className={cn(
                  "size-[18px] transition-colors",
                  active ? "text-brand-bright" : "text-ink-faint group-hover:text-ink-muted",
                )}
              />
              {item.label}
              {active && <span className="ml-auto size-1.5 rounded-full bg-brand-bright" />}
            </Link>
          );
        })}

        {isAdmin && (
          <Link
            href="/admin"
            className="group mt-1 flex items-center gap-3 rounded-xl border border-info/20 bg-info/5 px-3 py-2.5 text-sm font-medium text-info transition-all duration-300 hover:bg-info/10"
          >
            <ShieldCheck className="size-[18px]" />
            Admin
          </Link>
        )}
      </nav>

      <div className="mt-auto rounded-xl border border-line/70 bg-surface/40 p-4">
        <div className="flex items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand-bright to-accent text-xs font-semibold text-[#04130d]">
            {user.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-ink-faint">{user.email}</p>
          </div>
        </div>
        <form action={logout} className="mt-3">
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-line py-2 text-xs font-medium text-ink-muted transition-colors hover:border-danger/40 hover:text-danger"
          >
            <LogOut className="size-3.5" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
