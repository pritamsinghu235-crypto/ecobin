"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Route-change cross-fade. Opacity-only by design — no transform/filter —
 * so it never creates a containing block that would break the sticky
 * Topbar or MapLibre's absolutely-positioned layers.
 */
export function PageFade({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: reduce ? 0 : 0.35, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
