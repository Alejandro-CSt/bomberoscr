"use client";
import type { MapRef } from "@vis.gl/react-maplibre";
// `as MapType` to not shadow the global type `Map`
import type { Map as MapType } from "maplibre-gl";
import { createContext, useContext } from "react";

interface MapContextProps {
  zoomIn: () => void;
  zoomOut: () => void;
  flyTo: (latitude: number, longitude: number, zoom: number) => void;
  centerBearing: () => void;
}

const MapContext = createContext<MapContextProps | undefined>(undefined);

export const useMap = () => {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMap must be used within a MapProvider");
  }
  return context;
};

export const MapProvider = ({
  mapRef,
  children
}: { mapRef: React.RefObject<MapRef>; children: React.ReactNode }) => {
  const getMapInstance = (): MapType | undefined => {
    return mapRef.current?.getMap() as MapType | undefined;
  };

  const zoomIn = () => {
    const map = getMapInstance();
    map?.zoomIn();
  };

  const zoomOut = () => {
    const map = getMapInstance();
    map?.zoomOut();
  };

  const flyTo = (latitude: number, longitude: number, zoom: number) => {
    const map = getMapInstance();
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = 3000;
    map?.flyTo({
      center: [longitude, latitude],
      duration: duration,
      zoom: zoom,
      animate: !prefersReducedMotion
    });
  };

  const centerBearing = () => {
    const map = getMapInstance();
    map?.resetNorthPitch();
  };

  return (
    <MapContext.Provider value={{ zoomIn, zoomOut, flyTo, centerBearing }}>
      {children}
    </MapContext.Provider>
  );
};
