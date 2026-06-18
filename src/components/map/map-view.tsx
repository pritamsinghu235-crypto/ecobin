"use client";

import { useEffect, useRef, useState } from "react";
import { LocateFixed, MapPin, Navigation, Loader2 } from "lucide-react";
import { BinMap, type BinMapHandle } from "@/components/map/bin-map";
import { Pill } from "@/components/ui/pill";
import { STATUS_COLOR } from "@/lib/map-style";
import { cn } from "@/lib/utils";
import type { MapMachine, MachineStatus } from "@/lib/types";

const STATUS_LABEL: Record<MachineStatus, string> = {
  active: "Available",
  full: "Full",
  offline: "Offline",
  maintenance: "Service",
};
const STATUS_TONE: Record<MachineStatus, "ok" | "warn" | "neutral" | "info"> = {
  active: "ok",
  full: "warn",
  offline: "neutral",
  maintenance: "info",
};

function fmtDistance(m?: number) {
  if (m == null) return null;
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
}

export function MapView({ initial }: { initial: MapMachine[] }) {
  const mapRef = useRef<BinMapHandle>(null);
  const [machines, setMachines] = useState<MapMachine[]>(initial);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [nearest, setNearest] = useState<MapMachine[] | null>(null);
  const [locating, setLocating] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  // Live telemetry — poll the same endpoint the network panel uses.
  useEffect(() => {
    let active = true;
    const tick = async () => {
      try {
        const res = await fetch("/api/machines", { cache: "no-store" });
        if (!res.ok) return;
        const json = await res.json();
        if (active && json.machines) setMachines(json.machines as MapMachine[]);
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

  const selected = machines.find((m) => m.id === selectedId) ?? null;

  function select(m: MapMachine) {
    setSelectedId(m.id);
    mapRef.current?.flyTo(m.lng, m.lat, 15);
  }

  function findNearest() {
    setLocating(true);
    setNote(null);

    const run = async (lat: number, lng: number, fromGeo: boolean) => {
      try {
        const res = await fetch(`/api/machines/nearest?lat=${lat}&lng=${lng}&limit=3`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (res.ok && json.machines?.length) {
          setNearest(json.machines as MapMachine[]);
          const first = json.machines[0] as MapMachine;
          mapRef.current?.flyTo(first.lng, first.lat, 14);
          if (!fromGeo) setNote("Using map centre — enable location for results near you.");
        } else {
          setNote("No available machines found nearby.");
        }
      } catch {
        setNote("Could not fetch nearest machines.");
      } finally {
        setLocating(false);
      }
    };

    if (!navigator.geolocation) {
      run(51.508, -0.1, false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => run(pos.coords.latitude, pos.coords.longitude, true),
      () => {
        setNote("Location denied — showing machines near the city centre.");
        run(51.508, -0.1, false);
      },
      { timeout: 8000 },
    );
  }

  const counts = machines.reduce(
    (acc, m) => ({ ...acc, [m.status]: (acc[m.status] ?? 0) + 1 }),
    {} as Record<string, number>,
  );

  const list = nearest ?? machines;

  return (
    <div className="relative flex-1">
      <BinMap ref={mapRef} machines={machines} selectedId={selectedId} onSelect={select} />

      {/* Side panel */}
      <div className="pointer-events-none absolute inset-x-4 top-4 bottom-4 flex flex-col sm:inset-x-auto sm:left-4 sm:w-80">
        <div className="glass pointer-events-auto flex max-h-full flex-col rounded-2xl">
          <div className="border-b border-line/60 p-4">
            <button
              onClick={findNearest}
              disabled={locating}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-brand text-sm font-medium text-[#04130d] transition-colors hover:bg-brand-bright disabled:opacity-70"
            >
              {locating ? <Loader2 className="size-4 animate-spin" /> : <LocateFixed className="size-4" />}
              {locating ? "Locating…" : "Find nearest available"}
            </button>
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-ink-muted">
              {(["active", "full", "offline", "maintenance"] as MachineStatus[]).map((s) => (
                <span key={s} className="inline-flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ background: STATUS_COLOR[s] }} />
                  {STATUS_LABEL[s]} {counts[s] ?? 0}
                </span>
              ))}
            </div>
            {note && <p className="mt-2 text-xs text-warn">{note}</p>}
            {nearest && (
              <button
                onClick={() => setNearest(null)}
                className="mt-2 text-xs text-brand-bright hover:underline"
              >
                ← Show all machines
              </button>
            )}
          </div>

          <ul className="min-h-0 flex-1 divide-y divide-line/50 overflow-y-auto">
            {list.map((m) => (
              <li key={m.id}>
                <button
                  onClick={() => select(m)}
                  className={cn(
                    "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface/50",
                    selectedId === m.id && "bg-surface/60",
                  )}
                >
                  <span
                    className="mt-0.5 size-2.5 shrink-0 rounded-full"
                    style={{ background: STATUS_COLOR[m.status] }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{m.name}</p>
                    <p className="truncate text-xs text-ink-faint">
                      {m.code} · {m.fill_level}% full
                      {fmtDistance(m.distance_m) ? ` · ${fmtDistance(m.distance_m)}` : ""}
                    </p>
                  </div>
                  <Pill tone={STATUS_TONE[m.status]}>{STATUS_LABEL[m.status]}</Pill>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Selected detail card */}
      {selected && (
        <div className="pointer-events-none absolute inset-x-4 bottom-4 sm:inset-x-auto sm:right-4 sm:w-80">
          <div className="glass pointer-events-auto animate-rise rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold tracking-tight">{selected.name}</h3>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-faint">
                  <MapPin className="size-3" />
                  {selected.address ?? selected.code}
                </p>
              </div>
              <Pill tone={STATUS_TONE[selected.status]} dot>
                {STATUS_LABEL[selected.status]}
              </Pill>
            </div>

            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-ink-muted">
                <span>Fill level</span>
                <span className="font-mono">{selected.fill_level}%</span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${selected.fill_level}%`,
                    background:
                      selected.fill_level >= 95
                        ? "var(--color-danger)"
                        : selected.fill_level >= 75
                          ? "var(--color-warn)"
                          : "var(--color-brand-bright)",
                  }}
                />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {selected.accepted_materials.map((mat) => (
                <span key={mat} className="pill bg-surface text-ink-muted">
                  {mat}
                </span>
              ))}
            </div>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selected.lat},${selected.lng}`}
              target="_blank"
              rel="noreferrer"
              className="mt-3 flex h-10 items-center justify-center gap-2 rounded-full border border-line text-sm font-medium text-ink transition-colors hover:border-brand/40"
            >
              <Navigation className="size-4" />
              Directions
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
