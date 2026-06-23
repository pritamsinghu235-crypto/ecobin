"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { Map as MLMap, Marker as MLMarker } from "maplibre-gl";
import { DARK_MAP_STYLE, DEFAULT_CENTER, DEFAULT_ZOOM, STATUS_COLOR } from "@/lib/map-style";
import type { MapMachine } from "@/lib/types";

export type BinMapHandle = {
  flyTo: (lng: number, lat: number, zoom?: number) => void;
};

/** Update an existing pin's appearance in place (no re-creation). */
function stylePin(el: HTMLDivElement, m: MapMachine, selected: boolean) {
  const color = STATUS_COLOR[m.status] ?? "#5b6b85";
  const size = selected ? 22 : 15;
  const live = m.status === "active";
  el.style.width = `${size}px`;
  el.style.height = `${size}px`;
  el.style.borderRadius = "50%";
  el.style.background = color;
  el.style.border = "2px solid #07101f";
  el.style.boxShadow = `0 0 0 ${selected ? 4 : 2}px ${color}40, 0 0 ${live ? 12 : 6}px ${color}${live ? "aa" : "55"}, 0 4px 12px #0009`;
  el.style.cursor = "pointer";
  el.style.transition =
    "width .25s ease, height .25s ease, box-shadow .3s ease, background .3s ease";
  el.title = `${m.name} · ${m.fill_level}%`;
}

export const BinMap = forwardRef<BinMapHandle, {
  machines: MapMachine[];
  selectedId: string | null;
  onSelect: (m: MapMachine) => void;
}>(function BinMap({ machines, selectedId, onSelect }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const mlRef = useRef<typeof import("maplibre-gl") | null>(null);
  const markersRef = useRef<Map<string, MLMarker>>(new Map());
  const onSelectRef = useRef(onSelect);
  const fittedRef = useRef(false);
  const [ready, setReady] = useState(false);

  onSelectRef.current = onSelect;

  useImperativeHandle(ref, () => ({
    flyTo(lng, lat, zoom = 15) {
      mapRef.current?.flyTo({ center: [lng, lat], zoom, duration: 1200, essential: true });
    },
  }));

  // Create the map once (library imported lazily to stay SSR-safe).
  useEffect(() => {
    let cancelled = false;
    const markers = markersRef.current; // stable Map instance, safe for cleanup
    (async () => {
      const maplibregl = await import("maplibre-gl");
      if (cancelled || !containerRef.current) return;
      mlRef.current = maplibregl;

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: DARK_MAP_STYLE,
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        attributionControl: { compact: true },
      });
      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");
      map.on("load", () => {
        if (!cancelled) setReady(true);
      });
      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      markers.forEach((mk) => mk.remove());
      markers.clear();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Diff markers when data/selection changes — update in place so polling
  // never re-creates pins (which would replay the pop-in animation).
  useEffect(() => {
    const map = mapRef.current;
    const maplibregl = mlRef.current;
    if (!ready || !map || !maplibregl) return;

    const seen = new Set<string>();
    for (const m of machines) {
      seen.add(m.id);
      let marker = markersRef.current.get(m.id);
      if (!marker) {
        const el = document.createElement("div");
        el.className = "wastelytix-pin"; // pop-in animation, plays once
        const machine = m; // capture stable id + coords for the click handler
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          onSelectRef.current(machine);
        });
        marker = new maplibregl.Marker({ element: el }).setLngLat([m.lng, m.lat]).addTo(map);
        markersRef.current.set(m.id, marker);
      } else {
        marker.setLngLat([m.lng, m.lat]);
      }
      stylePin(marker.getElement() as HTMLDivElement, m, m.id === selectedId);
    }

    // Remove pins for machines that disappeared.
    for (const [id, marker] of markersRef.current) {
      if (!seen.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    }

    if (!fittedRef.current && machines.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      machines.forEach((m) => bounds.extend([m.lng, m.lat]));
      map.fitBounds(bounds, { padding: 80, maxZoom: 14, duration: 0 });
      fittedRef.current = true;
    }
  }, [ready, machines, selectedId]);

  return <div ref={containerRef} className="absolute inset-0" />;
});
