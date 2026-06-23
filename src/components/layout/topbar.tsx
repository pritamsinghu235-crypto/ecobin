import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { Pill } from "@/components/ui/pill";

export function Topbar({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-10 flex items-center gap-4 border-b border-line/70 bg-canvas/70 py-4 pl-16 pr-5 backdrop-blur-xl lg:px-8">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {action}
        <Pill tone="ok" dot className="hidden sm:inline-flex">
          Live
        </Pill>
        <button
          aria-label="Search"
          className="grid size-10 place-items-center rounded-full border border-line text-ink-muted transition-colors hover:border-brand/40 hover:text-ink"
        >
          <Search className="size-[18px]" />
        </button>
        <Link
          href="/notifications"
          aria-label="Notifications"
          className="grid size-10 place-items-center rounded-full border border-line text-ink-muted transition-colors hover:border-brand/40 hover:text-ink"
        >
          <Bell className="size-[18px]" />
        </Link>
        <div className="size-10 rounded-full bg-gradient-to-br from-brand-bright to-accent" />
      </div>
    </header>
  );
}
