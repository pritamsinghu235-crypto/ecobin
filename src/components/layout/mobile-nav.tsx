"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, ShieldCheck, ArrowLeft } from "lucide-react";
import { Wordmark } from "@/components/brand";
import { cn } from "@/lib/utils";
import { logout } from "@/app/(auth)/actions";
import { userNav, adminNav, type NavItem } from "@/lib/nav";

/**
 * Mobile-only navigation: a hamburger trigger + slide-in drawer holding every
 * route. Hidden on lg+ (the desktop sidebar takes over). Nav config is imported
 * here so icon components never cross the server→client boundary as props.
 */
export function MobileNav({
  variant = "app",
  isAdmin = false,
  user,
}: {
  variant?: "app" | "admin";
  isAdmin?: boolean;
  user?: { name: string; email: string };
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Lock body scroll + close on Escape while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const items: NavItem[] = variant === "admin" ? adminNav : userNav;
  const secondary: NavItem[] =
    variant === "admin"
      ? [{ href: "/dashboard", label: "Back to app", icon: ArrowLeft }]
      : isAdmin
        ? [{ href: "/admin", label: "Admin", icon: ShieldCheck }]
        : [];

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(href + "/");

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        className="fixed left-4 top-3 z-40 grid size-10 place-items-center rounded-full border border-line bg-canvas/80 text-ink backdrop-blur-xl lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      <div
        onClick={() => setOpen(false)}
        aria-hidden
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      <aside
        className={cn(
          "glass fixed inset-y-0 left-0 z-50 flex w-72 max-w-[82%] flex-col rounded-none border-y-0 border-l-0 p-4 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-2 py-2">
          <Link href="/dashboard" onClick={() => setOpen(false)}>
            <Wordmark />
          </Link>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="grid size-9 place-items-center rounded-full border border-line text-ink-muted"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="mt-4 flex flex-1 flex-col gap-1 overflow-y-auto">
          {items.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-dim/50 text-ink"
                    : "text-ink-muted hover:bg-surface/70 hover:text-ink",
                )}
              >
                <item.icon
                  className={cn("size-[18px]", active ? "text-brand-bright" : "text-ink-faint")}
                />
                {item.label}
                {active && <span className="ml-auto size-1.5 rounded-full bg-brand-bright" />}
              </Link>
            );
          })}

          {secondary.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="mt-1 flex items-center gap-3 rounded-xl border border-info/20 bg-info/5 px-3 py-2.5 text-sm font-medium text-info"
            >
              <item.icon className="size-[18px]" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-2 rounded-xl border border-line/70 bg-surface/40 p-4">
          {user && (
            <div className="mb-3 min-w-0">
              <p className="truncate text-sm font-medium">{user.name}</p>
              <p className="truncate text-xs text-ink-faint">{user.email}</p>
            </div>
          )}
          <form action={logout}>
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
    </>
  );
}
