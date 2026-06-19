"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Check, Coins, Loader2 } from "lucide-react";
import { redeemReward } from "@/app/(app)/actions";
import { cn } from "@/lib/utils";

function CoinBurst() {
  const coins = [-28, -10, 10, 28];
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
      {coins.map((x, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 0, x }}
          animate={{ opacity: [0, 1, 0], y: -34, scale: [0.6, 1, 0.9] }}
          transition={{ duration: 0.8, delay: i * 0.05, ease: "easeOut" }}
          className="absolute text-warn"
        >
          <Coins className="size-4" />
        </motion.span>
      ))}
    </div>
  );
}

export function RedeemButton({
  rewardId,
  affordable,
  inStock,
}: {
  rewardId: string;
  affordable: boolean;
  inStock: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function onClick() {
    setError(null);
    startTransition(async () => {
      const res = await redeemReward(rewardId);
      if (res.ok) {
        setDone(true);
        router.refresh();
        setTimeout(() => setDone(false), 2500);
      } else {
        setError(res.error);
        setTimeout(() => setError(null), 3000);
      }
    });
  }

  const disabled = pending || !affordable || !inStock;

  return (
    <div className="relative space-y-1.5">
      <AnimatePresence>{done && <CoinBurst />}</AnimatePresence>
      <motion.button
        onClick={onClick}
        disabled={disabled}
        whileTap={{ scale: disabled ? 1 : 0.97 }}
        className={cn(
          "flex h-10 w-full items-center justify-center gap-2 rounded-full text-sm font-medium transition-all duration-300",
          done
            ? "bg-brand-bright text-[#04130d]"
            : affordable && inStock
              ? "bg-brand text-[#04130d] hover:bg-brand-bright shadow-[0_8px_30px_-8px_var(--color-brand)]"
              : "cursor-not-allowed border border-line text-ink-faint",
        )}
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : done ? (
          <>
            <Check className="size-4" /> Redeemed
          </>
        ) : !inStock ? (
          "Out of stock"
        ) : affordable ? (
          "Redeem"
        ) : (
          "Not enough coins"
        )}
      </motion.button>
      {error && <p className="text-center text-xs text-danger">{error}</p>}
    </div>
  );
}
