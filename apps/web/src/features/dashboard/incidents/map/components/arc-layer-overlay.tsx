"use client";

import type { Station } from "@/features/dashboard/incidents/map/components/incident-map";
import { ArcLayer } from "@deck.gl/layers";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { useEffect, useRef } from "react";
import type { MapRef } from "react-map-gl/mapbox";

interface ArcLayerOverlayProps {
  mapRef: React.RefObject<MapRef | null>;
  stations: Station[];
  incidentLatitude: number;
  incidentLongitude: number;
  areCoordinatesValid: boolean;
}

export function ArcLayerOverlay({
  mapRef,
  stations,
  incidentLatitude,
  incidentLongitude,
  areCoordinatesValid
}: ArcLayerOverlayProps) {
  const overlayRef = useRef<MapboxOverlay | null>(null);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const overlay = new MapboxOverlay({ interleaved: true });
    map.addControl(overlay);
    overlayRef.current = overlay;

    const validStations = stations.filter(
      (s) => s && Number.isFinite(s.latitude) && Number.isFinite(s.longitude)
    );

    if (areCoordinatesValid && validStations.length > 0) {
      const layer = new ArcLayer({
        id: "arcs-3d",
        data: validStations,
        getSourcePosition: (d: Station) => [d.longitude, d.latitude],
        getTargetPosition: () => [incidentLongitude, incidentLatitude],
        getHeight: 0.5,
        getWidth: 2,
        getSourceColor: [250, 205, 1],
        getTargetColor: [250, 205, 1],
        greatCircle: true,
        pickable: false,
        numSegments: 64
      });

      overlay.setProps({ layers: [layer] });
    } else {
      // Explicitly clear any previous layers when coordinates are invalid or stations are missing
      overlay.setProps({ layers: [] });
    }

    return () => {
      overlay.setProps({ layers: [] });
      try {
        map.removeControl(overlay);
      } catch {
        // Map may already be removed
      }
      overlay.finalize();
      overlayRef.current = null;
    };
  }, [mapRef, stations, incidentLatitude, incidentLongitude, areCoordinatesValid]);

  return null;
}
