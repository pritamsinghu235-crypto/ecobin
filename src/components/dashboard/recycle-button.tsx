"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Recycle, Sparkles } from "lucide-react";
import { recycleBottle } from "@/app/(app)/actions";
import { cn } from "@/lib/utils";

export function RecycleButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);

  function onClick() {
    startTransition(async () => {
      const res = await recycleBottle();
      if (res.ok) {
        setToast(`AI detected ${res.plastic} · +${res.coins} coins`);
        router.refresh();
      } else {
        setToast(res.error);
      }
      setTimeout(() => setToast(null), 3200);
    });
  }

  return (
    <div className="flex items-center gap-3">
      {toast && (
        <span className="animate-rise pill bg-brand-dim/60 text-brand-bright">
          <Sparkles className="size-3.5" />
          {toast}
        </span>
      )}
      <button
        onClick={onClick}
        disabled={pending}
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-medium text-[#04130d]",
          "shadow-[0_8px_30px_-8px_var(--color-brand)] transition-all duration-300",
          "hover:bg-brand-bright disabled:opacity-70",
        )}
      >
        <Recycle className={cn("size-4", pending && "animate-spin")} />
        {pending ? "Scanning…" : "Recycle a bottle"}
      </button>
    </div>
  );
}
