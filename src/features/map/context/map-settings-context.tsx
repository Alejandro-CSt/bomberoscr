"use client";

import { type ReactNode, createContext, useContext, useState } from "react";
import { z } from "zod";

export type MapStyle = "light" | "dark";
export type ShowStations = "all" | "operative" | "none";
export type IncidentTimeRange = "24h" | "48h" | "disabled";

const styleSchema = z.enum(["light", "dark"]).default("light") as z.ZodType<MapStyle>;
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
    return schema.parse(undefined);
  }
}

type MapSettingsContextType = {
  style: MapStyle;
  setStyle: (newStyle: MapStyle) => void;
  showStations: ShowStations;
  setShowStations: (value: ShowStations) => void;
  incidentTimeRange: IncidentTimeRange;
  setIncidentTimeRange: (value: IncidentTimeRange) => void;
};

const MapSettingsContext = createContext<MapSettingsContextType | undefined>(undefined);

export function MapSettingsProvider({ children }: { children: ReactNode }) {
  const [style, setStyleState] = useState<MapStyle>(() =>
    validateSetting(localStorage.getItem("mapStyle") || "light", styleSchema)
  );
  const [showStations, setShowStationsState] = useState<ShowStations>(() =>
    validateSetting(localStorage.getItem("mapStations") || undefined, showStationsSchema)
  );
  const [incidentTimeRange, setIncidentTimeRangeState] = useState<IncidentTimeRange>(() =>
    validateSetting(
      localStorage.getItem("mapIncidentTimeRange") || undefined,
      incidentTimeRangeSchema
    )
  );

  const setStyle = (newStyle: MapStyle) => {
    setStyleState(newStyle);
    localStorage.setItem("mapStyle", newStyle);
  };

  const setShowStations = (value: ShowStations) => {
    setShowStationsState(value);
    localStorage.setItem("mapStations", value);
  };

  const setIncidentTimeRange = (value: IncidentTimeRange) => {
    setIncidentTimeRangeState(value);
    localStorage.setItem("mapIncidentTimeRange", value);
  };

  return (
    <MapSettingsContext.Provider
      value={{
        style,
        setStyle,
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
