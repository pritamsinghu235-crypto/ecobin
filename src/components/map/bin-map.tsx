"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import type { Map as MLMap, Marker as MLMarker } from "maplibre-gl";
import { DARK_MAP_STYLE, DEFAULT_CENTER, DEFAULT_ZOOM, STATUS_COLOR } from "@/lib/map-style";
import type { MapMachine } from "@/lib/types";

export type BinMapHandle = {
  flyTo: (lng: number, lat: number, zoom?: number) => void;
};

function makePin(m: MapMachine, selected: boolean): HTMLDivElement {
  const el = document.createElement("div");
  const color = STATUS_COLOR[m.status] ?? "#5b6b85";
  const size = selected ? 22 : 15;
  el.style.cssText = [
    `width:${size}px`,
    `height:${size}px`,
    "border-radius:50%",
    `background:${color}`,
    "border:2px solid #07101f",
    `box-shadow:0 0 0 ${selected ? 4 : 2}px ${color}40, 0 4px 12px #0009`,
    "cursor:pointer",
    "transition:width .2s ease,height .2s ease,box-shadow .2s ease",
  ].join(";");
  el.title = `${m.name} · ${m.fill_level}%`;
  return el;
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
      markersRef.current.forEach((mk) => mk.remove());
      markersRef.current.clear();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // (Re)draw markers when data or selection changes.
  useEffect(() => {
    const map = mapRef.current;
    const maplibregl = mlRef.current;
    if (!ready || !map || !maplibregl) return;

    markersRef.current.forEach((mk) => mk.remove());
    markersRef.current.clear();

    for (const m of machines) {
      const el = makePin(m, m.id === selectedId);
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectRef.current(m);
      });
      const marker = new maplibregl.Marker({ element: el }).setLngLat([m.lng, m.lat]).addTo(map);
      markersRef.current.set(m.id, marker);
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
