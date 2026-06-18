"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Coins } from "lucide-react";
import { toggleReward, deleteReward } from "@/app/admin/actions";
import { cn } from "@/lib/utils";
import type { Reward } from "@/lib/types";

export function RewardRow({ reward }: { reward: Reward }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      await toggleReward(reward.id, !reward.active);
      router.refresh();
    });
  }

  function remove() {
    if (!confirm(`Delete reward "${reward.title}"?`)) return;
    startTransition(async () => {
      await deleteReward(reward.id);
      router.refresh();
    });
  }

  return (
    <tr className="border-b border-line/40 last:border-0" style={{ opacity: pending ? 0.5 : 1 }}>
      <td className="px-5 py-3">
        <p className="text-sm font-medium">{reward.title}</p>
        <p className="truncate text-xs text-ink-faint">{reward.description}</p>
      </td>
      <td className="px-5 py-3">
        <span className="inline-flex items-center gap-1 text-sm text-warn">
          <Coins className="size-3.5" />
          {reward.cost_coins}
        </span>
      </td>
      <td className="px-5 py-3 text-sm text-ink-muted">
        {reward.stock === null ? "∞" : reward.stock}
      </td>
      <td className="px-5 py-3">
        <button
          onClick={toggle}
          disabled={pending}
          className={cn(
            "relative h-5 w-9 rounded-full transition-colors",
            reward.active ? "bg-brand" : "bg-line",
          )}
          aria-label="Toggle active"
        >
          <span
            className={cn(
              "absolute top-0.5 size-4 rounded-full bg-white transition-transform",
              reward.active ? "translate-x-4" : "translate-x-0.5",
            )}
          />
        </button>
      </td>
      <td className="px-5 py-3 text-right">
        <button
          onClick={remove}
          disabled={pending}
          aria-label="Delete reward"
          className="text-ink-faint transition-colors hover:text-danger disabled:opacity-50"
        >
          <Trash2 className="size-4" />
        </button>
      </td>
    </tr>
  );
}
