"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Award, Bell, CheckCheck, Gift, Radio } from "lucide-react";
import { markAllNotificationsRead, markNotificationRead } from "@/app/(app)/actions";
import { cn } from "@/lib/utils";
import type { AppNotification } from "@/lib/types";

const ICONS: Record<string, typeof Bell> = {
  badge: Award,
  reward: Gift,
  machine: Radio,
  info: Bell,
};

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationsList({ items }: { items: AppNotification[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const hasUnread = items.some((n) => !n.read_at);

  function readOne(id: string) {
    startTransition(async () => {
      await markNotificationRead(id);
      router.refresh();
    });
  }

  function readAll() {
    startTransition(async () => {
      await markAllNotificationsRead();
      router.refresh();
    });
  }

  if (items.length === 0) {
    return (
      <div className="grid place-items-center py-20 text-center">
        <div className="grid size-12 place-items-center rounded-full bg-surface text-ink-faint">
          <Bell className="size-5" />
        </div>
        <p className="mt-3 text-sm font-medium">You&apos;re all caught up</p>
        <p className="mt-1 text-xs text-ink-faint">
          Earn badges and redeem rewards to see alerts here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {hasUnread && (
        <div className="flex justify-end">
          <button
            onClick={readAll}
            disabled={pending}
            className="flex items-center gap-1.5 text-xs font-medium text-brand-bright hover:underline disabled:opacity-50"
          >
            <CheckCheck className="size-3.5" />
            Mark all read
          </button>
        </div>
      )}

      <ul className="space-y-2">
        {items.map((n) => {
          const Icon = ICONS[n.type] ?? Bell;
          const unread = !n.read_at;
          return (
            <li
              key={n.id}
              onClick={() => unread && readOne(n.id)}
              className={cn(
                "glass flex items-start gap-3 rounded-xl p-4 transition-colors",
                unread ? "cursor-pointer border-brand/20" : "opacity-70",
              )}
            >
              <div
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-lg",
                  unread ? "bg-brand-dim/50 text-brand-bright" : "bg-surface text-ink-faint",
                )}
              >
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{n.title}</p>
                {n.body && <p className="mt-0.5 text-sm text-ink-muted">{n.body}</p>}
                <p className="mt-1 text-xs text-ink-faint">{timeAgo(n.created_at)}</p>
              </div>
              {unread && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-bright" />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
