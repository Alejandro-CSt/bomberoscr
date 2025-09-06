"use client";

import { type ReactNode, createContext, useContext, useState } from "react";
import { z } from "zod";

export type ShowStations = "all" | "operative" | "none";
export type IncidentTimeRange = "24h" | "48h" | "disabled";

const showStationsSchema = z
  .enum(["all", "operative", "none"])
  .default("operative") as z.ZodType<ShowStations>;
const incidentTimeRangeSchema = z
  .enum(["24h", "48h", "disabled"])
  .default("24h") as z.ZodType<IncidentTimeRange>;

function validateSetting<T>(value: unknown, schema: z.ZodType<T>): T {
  try {
    return schema.parse(value);
  } catch {
    // Fallback to the schema's default value if parsing fails or value is undefined
    return schema.parse(undefined);
  }
}

function getLocalStorageItem(key: string, fallback: string | undefined): string | undefined {
  // Return fallback if window is not defined (SSR)
  if (typeof window === "undefined") {
    return fallback;
  }
  return localStorage.getItem(key) || fallback;
}

type MapSettingsContextType = {
  showStations: ShowStations;
  setShowStations: (value: ShowStations) => void;
  incidentTimeRange: IncidentTimeRange;
  setIncidentTimeRange: (value: IncidentTimeRange) => void;
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

const MapSettingsContext = createContext<MapSettingsContextType | undefined>(undefined);

export function MapSettingsProvider({ children }: { children: ReactNode }) {
  const [showStations, setShowStationsState] = useState<ShowStations>(() =>
    validateSetting(getLocalStorageItem("mapStations", undefined), showStationsSchema)
  );
  const [incidentTimeRange, setIncidentTimeRangeState] = useState<IncidentTimeRange>(() =>
    validateSetting(getLocalStorageItem("mapIncidentTimeRange", undefined), incidentTimeRangeSchema)
  );
  const [hideRegularIncidents, setHideRegularIncidents] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<
    { id: number; latitude: string; longitude: string }[]
  >([]);
  const [viewportBounds, setViewportBounds] = useState<{
    minLat: number;
    minLng: number;
    maxLat: number;
    maxLng: number;
  } | null>(null);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  const setShowStations = (value: ShowStations) => {
    setShowStationsState(value);
    if (typeof window !== "undefined") localStorage.setItem("mapStations", value);
  };

  const setIncidentTimeRange = (value: IncidentTimeRange) => {
    setIncidentTimeRangeState(value);
    if (typeof window !== "undefined") localStorage.setItem("mapIncidentTimeRange", value);
  };

  return (
    <MapSettingsContext.Provider
      value={{
        showStations,
        setShowStations,
        incidentTimeRange,
        setIncidentTimeRange,
        hideRegularIncidents,
        setHideRegularIncidents,
        searchResults,
        setSearchResults,
        viewportBounds,
        setViewportBounds,
        isSearching,
        setIsSearching
      }}
    >
      {children}
    </MapSettingsContext.Provider>
  );
}

export function useMapSettings() {
  const context = useContext(MapSettingsContext);
  if (!context) {
    throw new Error("useMapSettings must be used within a MapSettingsProvider");
  }
  return context;
}
