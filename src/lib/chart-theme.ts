import type { PlasticType } from "@/lib/types";

/** Distinct accessible colors per plastic type for charts. */
export const PLASTIC_COLORS: Record<PlasticType, string> = {
  PET: "#34d399",
  HDPE: "#22d3ee",
  PVC: "#a78bfa",
  LDPE: "#fbbf24",
  PP: "#fb7185",
  OTHER: "#5b6b85",
};

export const CHART_GRID = "#1c2942";
export const CHART_AXIS = "#5b6b85";
