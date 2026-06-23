"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { Cpu, Gauge, Sun, Coins } from "lucide-react";
import { HeroFallback } from "./HeroFallback";

// Lazy-load the WebGL scene only on the client; static fallback while it loads.
const HeroScene = dynamic(() => import("./HeroScene"), {
  ssr: false,
  loading: () => <HeroFallback />,
});

const CHIPS = [
  { icon: Cpu, label: "AI vision · 5 plastics", pos: "left-2 top-6 sm:left-6" },
  { icon: Gauge, label: "Live fill sensor", pos: "right-2 top-10 sm:right-6" },
  { icon: Sun, label: "Solar powered", pos: "left-2 bottom-10 sm:left-8" },
  { icon: Coins, label: "Earn EcoCoins", pos: "right-2 bottom-6 sm:right-8" },
];

export function HeroVisual() {
  const ref = useRef<HTMLDivElement>(null);
  // off = static SVG (no WebGL / reduced-motion / very low-end);
  // lite = reduced 3D for mobile & touch; full = desktop 3D.
  const [mode, setMode] = useState<"off" | "lite" | "full">("off");
  const [visible, setVisible] = useState(true);

  // Capability gate — picks the richest tier the device can sustain at 60fps.
  // Deferred a frame so the upgrade happens after first paint (and off the
  // effect's synchronous path), keeping the initial render light. Mobile/touch
  // no longer disqualifies 3D — it just selects the lighter `lite` tier.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const smallOrTouch =
        window.matchMedia("(max-width: 768px)").matches ||
        window.matchMedia("(pointer: coarse)").matches;
      let webgl = false;
      try {
        const c = document.createElement("canvas");
        webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
      } catch {
        webgl = false;
      }
      const cores = navigator.hardwareConcurrency ?? 8;
      // Hard blockers keep the static SVG; otherwise mobile gets the lite scene.
      if (reduce || !webgl || cores <= 2) setMode("off");
      else setMode(smallOrTouch ? "lite" : "full");
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // Pause rendering when the hero scrolls out of view.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0.05,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="relative mx-auto mt-12 h-[340px] w-full max-w-3xl sm:h-[420px]"
    >
      {/* soft floor glow */}
      <div className="pointer-events-none absolute inset-x-10 bottom-10 h-24 rounded-full bg-brand/20 blur-3xl" />

      {mode === "off" ? (
        <HeroFallback />
      ) : (
        <HeroScene frameloop={visible ? "always" : "never"} quality={mode} />
      )}

      {/* feature callouts floating around the bin (md+ only) */}
      {CHIPS.map((chip, i) => (
        <motion.div
          key={chip.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: [0, -6, 0] }}
          transition={{
            opacity: { duration: 0.6, delay: 0.4 + i * 0.15 },
            y: { duration: 4 + i, repeat: Infinity, ease: "easeInOut" },
          }}
          className={`pointer-events-none absolute hidden items-center gap-2 sm:flex ${chip.pos}`}
        >
          <span className="glass flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium text-ink-muted">
            <chip.icon className="size-3.5 text-brand-bright" />
            {chip.label}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
