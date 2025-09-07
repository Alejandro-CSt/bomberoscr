"use client";

import {
  type IncidentTimeRange,
  type MapSettingsContextType,
  type ShowStations,
  getLocalStorageItem,
  incidentTimeRangeSchema,
  showStationsSchema,
  validateSetting
} from "@/features/map/settings/types";
import { type ReactNode, createContext, useState } from "react";

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

export { MapSettingsContext };
