"use client";

import { useEffect } from "react";
import { animate, motion, useMotionValue, useTransform, useReducedMotion } from "motion/react";
import { formatCompact } from "@/lib/utils";

/** Serializable format keys — safe to pass from Server Components. */
export type NumberFormat = "int" | "compact" | "fixed1";

function formatValue(kind: NumberFormat, n: number): string {
  switch (kind) {
    case "compact":
      return formatCompact(n);
    case "fixed1":
      return n.toFixed(1);
    default:
      return Math.round(n).toLocaleString("en");
  }
}

/**
 * Smoothly counts a number up to `value` on mount / when it changes.
 * Purely presentational — the value passed in is the source of truth.
 * `format` is a string key (not a function) so it stays serializable.
 */
export function AnimatedNumber({
  value,
  format = "int",
  className,
}: {
  value: number;
  format?: NumberFormat;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const text = useTransform(mv, (latest) => formatValue(format, latest));

  useEffect(() => {
    if (reduce) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, { duration: 1, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [value, reduce, mv]);

  return <motion.span className={className}>{text}</motion.span>;
}
