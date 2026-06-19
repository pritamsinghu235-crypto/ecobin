"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { type LucideIcon, Gauge, BatteryMedium, Wifi } from "lucide-react";
import { HeroFallback } from "./HeroFallback";
import { AnimatedNumber } from "@/components/animations/animated-number";
import type { BinData, BinStatus } from "./BinCanvas";

// Local shape (avoids importing the server-only data module into client code).
type LiveMachine = { status: BinStatus; fill_level: number };

const LazyBinCanvas = dynamic(() => import("./BinCanvas"), {
  ssr: false,
  loading: () => <HeroFallback />,
});

type Agg = { fill: number; status: BinStatus; battery: number; online: number; total: number };

/** Derive a single representative bin state from the live fleet. */
function aggregate(machines: LiveMachine[]): Agg {
  const total = machines.length || 1;
  const online = machines.filter((m) => m.status !== "offline").length;
  const fill = Math.round(machines.reduce((s, m) => s + m.fill_level, 0) / total);
  const status: BinStatus = machines.some((m) => m.status === "active")
    ? "active"
    : machines.some((m) => m.status === "full")
      ? "full"
      : machines.some((m) => m.status === "maintenance")
        ? "maintenance"
        : "offline";
  // Battery isn't persisted in the schema — derive a fleet-power proxy from
  // the online ratio so it tracks real data without a schema change.
  const battery = Math.round(62 + 37 * (online / total));
  return { fill, status, battery, online, total };
}

export function BinVisualization({ initial }: { initial: LiveMachine[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const init = aggregate(initial);
  const dataRef = useRef<BinData>({ fill: init.fill, status: init.status });
  const [display, setDisplay] = useState<Agg>(init);
  const [mode, setMode] = useState<"fallback" | "3d">("fallback");
  const [inView, setInView] = useState(true);

  // Capability gate (deferred a frame, off the effect's synchronous path).
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
      const lowCores = (navigator.hardwareConcurrency ?? 8) <= 2;
      if (!reduce && !smallOrTouch && webgl && !lowCores) setMode("3d");
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // Pause the render loop when scrolled offscreen (frameloop → "never").
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Isolated live polling: writes refs (for the 3D) + sibling state (for the
  // HTML readouts). The memoized canvas never re-renders from this.
  useEffect(() => {
    let active = true;
    const tick = async () => {
      try {
        const res = await fetch("/api/machines", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (active && json.machines) {
          const agg = aggregate(json.machines as LiveMachine[]);
          dataRef.current.fill = agg.fill;
          dataRef.current.status = agg.status;
          setDisplay(agg);
        }
      } catch {
        /* keep last good state */
      }
    };
    const id = setInterval(tick, 5000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative flex h-full flex-col p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-ink-muted">Device Status</h3>
        <span className="flex items-center gap-1.5 text-xs text-ink-faint">
          <span className="size-1.5 rounded-full bg-brand-bright" /> live
        </span>
      </div>

      <div className="relative -mx-2 min-h-0 flex-1">
        {mode === "3d" ? <LazyBinCanvas dataRef={dataRef} inView={inView} /> : <HeroFallback />}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <Readout icon={Gauge} label="Fill" value={display.fill} suffix="%" />
        <Readout icon={BatteryMedium} label="Battery" value={display.battery} suffix="%" />
        <div className="rounded-xl border border-line/60 bg-surface/30 p-2">
          <Wifi className="mx-auto size-4 text-brand-bright" />
          <p className="mt-1 text-xs font-medium capitalize">{display.status}</p>
          <p className="text-[10px] text-ink-faint">
            {display.online}/{display.total} online
          </p>
        </div>
      </div>
    </div>
  );
}

function Readout({
  icon: Icon,
  label,
  value,
  suffix,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  suffix: string;
}) {
  return (
    <div className="rounded-xl border border-line/60 bg-surface/30 p-2">
      <Icon className="mx-auto size-4 text-brand-bright" />
      <p className="mt-1 text-sm font-semibold">
        <AnimatedNumber value={value} />
        {suffix}
      </p>
      <p className="text-[10px] text-ink-faint">{label}</p>
    </div>
  );
}
