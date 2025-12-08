"use client";

import type maplibregl from "maplibre-gl";
import { type ReactNode, createContext, useContext, useState } from "react";

type MapContextValue = {
  map: maplibregl.Map | null;
  setMap: (map: maplibregl.Map | null) => void;
};

const MapContext = createContext<MapContextValue | null>(null);

export function MapProvider({ children }: { children: ReactNode }) {
  const [map, setMap] = useState<maplibregl.Map | null>(null);

  return <MapContext.Provider value={{ map, setMap }}>{children}</MapContext.Provider>;
}

export function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMap must be used within a MapProvider");
  }
  return context;
}
