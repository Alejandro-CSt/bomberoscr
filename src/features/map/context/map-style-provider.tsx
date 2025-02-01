"use client";

import { LIGHT_MAP_STYLE } from "@/features/map/constants";
import type React from "react";
import { createContext, useContext, useState } from "react";

interface MapStyleContextProps {
  style: string;
  setStyle: (style: string) => void;
}

const MapStyleContext = createContext<MapStyleContextProps | undefined>(undefined);

export function MapStyleProvider({ children }: { children: React.ReactNode }) {
  const [style, setStyle] = useState(LIGHT_MAP_STYLE);
  return (
    <MapStyleContext.Provider value={{ style, setStyle }}>{children}</MapStyleContext.Provider>
  );
}

export const useMapStyle = () => {
  const context = useContext(MapStyleContext);
  if (!context) throw new Error("useMapStyle must be used within a MapStyleProvider");
  return context;
};
