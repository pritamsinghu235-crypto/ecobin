"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
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
      <AnimatePresence>
        {toast && (
          <motion.span
            initial={{ opacity: 0, x: 10, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 10, scale: 0.9 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
            className="pill bg-brand-dim/60 text-brand-bright"
          >
            <Sparkles className="size-3.5" />
            {toast}
          </motion.span>
        )}
      </AnimatePresence>
      <motion.button
        onClick={onClick}
        disabled={pending}
        whileHover={{ scale: pending ? 1 : 1.03 }}
        whileTap={{ scale: 0.97 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          "inline-flex h-11 items-center gap-2 rounded-full bg-brand px-5 text-sm font-medium text-[#04130d]",
          "shadow-[0_8px_30px_-8px_var(--color-brand)]",
          "hover:bg-brand-bright disabled:opacity-70",
        )}
      >
        <Recycle className={cn("size-4", pending && "animate-spin")} />
        {pending ? "Scanning…" : "Recycle a bottle"}
      </motion.button>
    </div>
  );
}
