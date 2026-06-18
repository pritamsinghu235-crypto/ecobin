"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { PLASTIC_TYPES } from "@/lib/types";
import { cn } from "@/lib/utils";

const tabs = ["ALL", ...PLASTIC_TYPES] as const;

export function FilterTabs() {
  const router = useRouter();
  const params = useSearchParams();
  const active = params.get("type") ?? "ALL";

  return (
    <div className="flex flex-wrap gap-1.5">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => router.push(t === "ALL" ? "/history" : `/history?type=${t}`)}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors duration-300",
            active === t
              ? "bg-brand text-[#04130d]"
              : "border border-line text-ink-muted hover:border-brand/40 hover:text-ink",
          )}
        >
          {t === "ALL" ? "All" : t}
        </button>
      ))}
    </div>
  );
}
