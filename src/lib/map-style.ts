import type { StyleSpecification } from "maplibre-gl";

/**
 * Dark raster basemap from CARTO (free, no API key, attribution required).
 * Matches the EcoBin futuristic theme without a paid tile provider.
 */
export const DARK_MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    carto: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
        "https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
        "https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
        "https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png",
      ],
      tileSize: 256,
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
    },
  },
  layers: [{ id: "carto-dark", type: "raster", source: "carto" }],
};

/** Default view — central London, matching the seeded machines. */
export const DEFAULT_CENTER: [number, number] = [-0.1, 51.508];
export const DEFAULT_ZOOM = 12;

export const STATUS_COLOR: Record<string, string> = {
  active: "#34d399",
  full: "#fbbf24",
  offline: "#5b6b85",
  maintenance: "#60a5fa",
};
