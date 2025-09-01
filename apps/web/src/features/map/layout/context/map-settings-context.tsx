"use client";

import { type ReactNode, createContext, useContext, useState } from "react"; // Removed useEffect
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
  // Removed style and setStyle
  showStations: ShowStations;
  setShowStations: (value: ShowStations) => void;
  incidentTimeRange: IncidentTimeRange;
  setIncidentTimeRange: (value: IncidentTimeRange) => void;
};

const MapSettingsContext = createContext<MapSettingsContextType | undefined>(undefined);

export function MapSettingsProvider({ children }: { children: ReactNode }) {
  const [showStations, setShowStationsState] = useState<ShowStations>(() =>
    validateSetting(getLocalStorageItem("mapStations", undefined), showStationsSchema)
  );
  const [incidentTimeRange, setIncidentTimeRangeState] = useState<IncidentTimeRange>(() =>
    validateSetting(getLocalStorageItem("mapIncidentTimeRange", undefined), incidentTimeRangeSchema)
  );

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
        setIncidentTimeRange
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
