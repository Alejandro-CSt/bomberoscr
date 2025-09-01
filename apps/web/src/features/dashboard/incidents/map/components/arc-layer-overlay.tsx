"use client";

import type { Station } from "@/features/dashboard/incidents/map/components/incident-map";
import { ArcLayer } from "@deck.gl/layers";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { useEffect, useRef } from "react";
import type { MapRef } from "react-map-gl/maplibre";

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

    if (!overlayRef.current) {
      overlayRef.current = new MapboxOverlay({ interleaved: true });
      map.addControl(overlayRef.current);
    }

    const overlay = overlayRef.current;
    const validStations = stations.filter(
      (s) => s && Number.isFinite(s.latitude) && Number.isFinite(s.longitude)
    );

    if (!areCoordinatesValid || validStations.length === 0) {
      overlay.setProps({ layers: [] });
      return;
    }

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
  }, [mapRef, stations, incidentLatitude, incidentLongitude, areCoordinatesValid]);

  useEffect(() => {
    return () => {
      const map = mapRef.current?.getMap();
      const overlay = overlayRef.current;
      if (overlay && map) {
        overlay.setProps({ layers: [] });
        map.removeControl(overlay);
        overlay.finalize();
        overlayRef.current = null;
      }
    };
  }, [mapRef]);

  return null;
}
