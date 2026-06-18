import { cn } from "@/lib/utils";

/** EcoBin logo mark — a recycling leaf inside a hexagon (smart-city tech feel). */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden>
      <defs>
        <linearGradient id="ecobin-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--color-brand-bright)" />
          <stop offset="1" stopColor="var(--color-accent)" />
        </linearGradient>
      </defs>
      <path
        d="M16 2.5 27.7 9v14L16 29.5 4.3 23V9z"
        fill="url(#ecobin-g)"
        fillOpacity="0.14"
        stroke="url(#ecobin-g)"
        strokeWidth="1.4"
      />
      <path
        d="M16 10.5l3.2 5.5h-2.1a3.3 3.3 0 0 1-5.6 2.2M16 21.5l-3.2-5.5h2.1a3.3 3.3 0 0 1 5.6-2.2"
        fill="none"
        stroke="url(#ecobin-g)"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <Logo />
      <span className="text-lg font-semibold tracking-tight">
        Eco<span className="text-brand-bright">Bin</span>
      </span>
    </div>
  );
}
