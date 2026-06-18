import { cn } from "@/lib/utils";

type Tone = "ok" | "warn" | "danger" | "info" | "neutral";

const tones: Record<Tone, string> = {
  ok: "bg-brand-dim/60 text-brand-bright",
  warn: "bg-warn/15 text-warn",
  danger: "bg-danger/15 text-danger",
  info: "bg-info/15 text-info",
  neutral: "bg-surface text-ink-muted",
};

const dots: Record<Tone, string> = {
  ok: "bg-brand-bright",
  warn: "bg-warn",
  danger: "bg-danger",
  info: "bg-info",
  neutral: "bg-ink-faint",
};

export function Pill({
  tone = "neutral",
  dot = false,
  className,
  children,
}: {
  tone?: Tone;
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span className={cn("pill", tones[tone], className)}>
      {dot && <span className={cn("size-1.5 rounded-full", dots[tone])} />}
      {children}
    </span>
  );
}
