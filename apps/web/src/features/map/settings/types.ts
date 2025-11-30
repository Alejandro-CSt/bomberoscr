import { z } from "zod";

export type ShowStations = "all" | "operative" | "none";
export type IncidentTimeRange = "24h" | "48h" | "disabled";
export type MapTheme = "light" | "dark";

export const showStationsSchema = z
  .enum(["all", "operative", "none"])
  .default("operative") as z.ZodType<ShowStations>;
export const incidentTimeRangeSchema = z
  .enum(["24h", "48h", "disabled"])
  .default("24h") as z.ZodType<IncidentTimeRange>;
export const mapThemeSchema = z.enum(["light", "dark"]).default("dark") as z.ZodType<MapTheme>;

export function validateSetting<T>(value: unknown, schema: z.ZodType<T>): T {
  try {
    return schema.parse(value);
  } catch {
    // Fallback to the schema's default value if parsing fails or value is undefined
    return schema.parse(undefined);
  }
}

export function getLocalStorageItem(key: string, fallback: string | undefined): string | undefined {
  // Return fallback if window is not defined (SSR)
  if (typeof window === "undefined") {
    return fallback;
  }
  return localStorage.getItem(key) || fallback;
}

export type MapSettingsContextType = {
  showStations: ShowStations;
  setShowStations: (value: ShowStations) => void;
  incidentTimeRange: IncidentTimeRange;
  setIncidentTimeRange: (value: IncidentTimeRange) => void;
  mapTheme: MapTheme;
  setMapTheme: (value: MapTheme) => void;
  hideRegularIncidents: boolean;
  setHideRegularIncidents: (value: boolean) => void;
  searchResults: { id: number; latitude: string; longitude: string }[];
  setSearchResults: (value: { id: number; latitude: string; longitude: string }[]) => void;
  viewportBounds: {
    minLat: number;
    minLng: number;
    maxLat: number;
    maxLng: number;
  } | null;
  setViewportBounds: (
    value: {
      minLat: number;
      minLng: number;
      maxLat: number;
      maxLng: number;
    } | null
  ) => void;
  isSearching: boolean;
  setIsSearching: (value: boolean) => void;
};
