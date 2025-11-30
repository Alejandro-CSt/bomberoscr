"use client";

import {
  CR_NE_CORNER,
  CR_SW_CORNER,
  DARK_MAP_STYLE,
  LIGHT_MAP_STYLE
} from "@/features/map/constants";
import { MapProvider, useMap } from "@/features/map/context/map-context";
import type { IncidentWithCoordinates } from "@/features/map/incidents/api/incidents";
import { MapFloatingControls } from "@/features/map/layout/components/floating-map-controls";
import type { SearchIncidentsResult } from "@/features/map/search/api/searchRouter";
import { useMapSettings } from "@/features/map/settings/hooks/use-map-settings";
import type { Station } from "@/features/map/stations/api/stations";
import { cn } from "@/features/shared/lib/utils";
import { trpc } from "@/features/trpc/client";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";

export const InteractiveMap = () => {
  const {
    mapTheme,
    showStations,
    incidentTimeRange,
    hideRegularIncidents,
    searchResults,
    setViewportBounds,
    isSearching
  } = useMapSettings();
  const incidentsQuery = trpc.incidents.getIncidentsCoordinates.useQuery({
    timeRange: incidentTimeRange
  });
  const allStations = trpc.stations.getStations.useQuery({ filter: "all" });
  const operativeStations = trpc.stations.getStations.useQuery({
    filter: "operative"
  });
  const stationsData =
    showStations === "none"
      ? []
      : showStations === "operative"
        ? operativeStations.data
        : allStations.data;

  const mapStyleUrl = mapTheme === "light" ? LIGHT_MAP_STYLE : DARK_MAP_STYLE;

  return (
    <div
      className="flex-1"
      style={{
        height: "calc(100dvh - var(--app-top-offset))",
        minHeight: "calc(100dvh - var(--app-top-offset))"
      }}
    >
      <MapProvider>
        <MapContainer
          mapStyleUrl={mapStyleUrl}
          setViewportBounds={setViewportBounds}
          isSearching={isSearching}
        >
          {stationsData?.map((station: Station) => (
            <StationMarker key={station.id} station={station} />
          ))}
          {!hideRegularIncidents &&
            incidentsQuery.data?.map((incident: IncidentWithCoordinates) => (
              <IncidentMarker key={incident.id} incident={incident} />
            ))}
          {hideRegularIncidents &&
            searchResults.map((incident: SearchIncidentsResult[number]) => (
              <IncidentMarker key={incident.id} incident={incident} />
            ))}
          <MapFloatingControls />
        </MapContainer>
      </MapProvider>
    </div>
  );
};

type MapContainerProps = {
  mapStyleUrl: string;
  setViewportBounds: (bounds: {
    minLat: number;
    minLng: number;
    maxLat: number;
    maxLng: number;
  }) => void;
  isSearching: boolean;
  children: ReactNode;
};

function MapContainer({
  mapStyleUrl,
  setViewportBounds,
  isSearching,
  children
}: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setMap } = useMap();
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const initialStyleRef = useRef(mapStyleUrl);

  useEffect(() => {
    if (!containerRef.current || mapInstanceRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: initialStyleRef.current,
      center: [-84.1341552, 9.9670834],
      zoom: 10,
      bearing: 0,
      pitch: 0,
      maxBounds: [
        // biome-ignore lint/style/noNonNullAssertion: not null
        [CR_SW_CORNER[0]!, CR_SW_CORNER[1]!],
        // biome-ignore lint/style/noNonNullAssertion: not null
        [CR_NE_CORNER[0]!, CR_NE_CORNER[1]!]
      ]
    });

    mapInstanceRef.current = map;

    const updateBounds = () => {
      const bounds = map.getBounds();
      if (!bounds) return;
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      setViewportBounds({
        minLat: sw.lat,
        minLng: sw.lng,
        maxLat: ne.lat,
        maxLng: ne.lng
      });
    };

    map.on("load", () => {
      setMap(map);
      setIsMapReady(true);
      updateBounds();
    });

    map.on("moveend", updateBounds);

    return () => {
      setMap(null);
      setIsMapReady(false);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [setViewportBounds, setMap]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !isMapReady) return;

    map.setStyle(mapStyleUrl);
  }, [mapStyleUrl, isMapReady]);

  return (
    <div ref={containerRef} className="relative h-full w-full">
      {isMapReady && children}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-10 transition-opacity duration-700 ease-in-out",
          isSearching ? "opacity-100" : "opacity-0"
        )}
        style={{
          boxShadow:
            "inset 0 0 20px var(--glow-primary-1, rgba(59, 130, 246, 0.6)), inset 0 0 35px var(--glow-primary-2, rgba(59, 130, 246, 0.3))",
          animation: isSearching ? "clockwiseGlow 2s linear infinite" : "none"
        }}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-10 transition-opacity duration-700 ease-in-out",
          isSearching ? "opacity-100" : "opacity-0"
        )}
        style={{
          boxShadow:
            "inset 0 0 25px var(--glow-secondary-1, rgba(59, 130, 246, 0.4)), inset 0 0 40px var(--glow-secondary-2, rgba(59, 130, 246, 0.2))",
          animation: isSearching ? "clockwiseGlow2 2.5s linear infinite" : "none"
        }}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-10 transition-opacity duration-700 ease-in-out",
          isSearching ? "opacity-100" : "opacity-0"
        )}
        style={{
          boxShadow:
            "inset 0 0 15px var(--glow-tertiary-1, rgba(59, 130, 246, 0.5)), inset 0 0 25px var(--glow-tertiary-2, rgba(59, 130, 246, 0.3))",
          animation: isSearching ? "clockwiseGlow3 1.8s linear infinite" : "none"
        }}
      />
      <style>{`
        @keyframes clockwiseGlow {
          0% {
            box-shadow: inset 3px 0 20px var(--glow-primary-1, rgba(59, 130, 246, 0.6)), inset 5px 0 35px var(--glow-primary-2, rgba(59, 130, 246, 0.3));
          }
          25% {
            box-shadow: inset 0 3px 20px var(--glow-primary-1, rgba(59, 130, 246, 0.6)), inset 0 5px 35px var(--glow-primary-2, rgba(59, 130, 246, 0.3));
          }
          50% {
            box-shadow: inset -3px 0 20px var(--glow-primary-1, rgba(59, 130, 246, 0.6)), inset -5px 0 35px var(--glow-primary-2, rgba(59, 130, 246, 0.3));
          }
          75% {
            box-shadow: inset 0 -3px 20px var(--glow-primary-1, rgba(59, 130, 246, 0.6)), inset 0 -5px 35px var(--glow-primary-2, rgba(59, 130, 246, 0.3));
          }
          100% {
            box-shadow: inset 3px 0 20px var(--glow-primary-1, rgba(59, 130, 246, 0.6)), inset 5px 0 35px var(--glow-primary-2, rgba(59, 130, 246, 0.3));
          }
        }
        @keyframes clockwiseGlow2 {
          0% {
            box-shadow: inset 2px 2px 25px var(--glow-secondary-1, rgba(59, 130, 246, 0.4)), inset 4px 4px 40px var(--glow-secondary-2, rgba(59, 130, 246, 0.2));
          }
          25% {
            box-shadow: inset -2px 2px 25px var(--glow-secondary-1, rgba(59, 130, 246, 0.4)), inset -4px 4px 40px var(--glow-secondary-2, rgba(59, 130, 246, 0.2));
          }
          50% {
            box-shadow: inset -2px -2px 25px var(--glow-secondary-1, rgba(59, 130, 246, 0.4)), inset -4px -4px 40px var(--glow-secondary-2, rgba(59, 130, 246, 0.2));
          }
          75% {
            box-shadow: inset 2px -2px 25px var(--glow-secondary-1, rgba(59, 130, 246, 0.4)), inset 4px -4px 40px var(--glow-secondary-2, rgba(59, 130, 246, 0.2));
          }
          100% {
            box-shadow: inset 2px 2px 25px var(--glow-secondary-1, rgba(59, 130, 246, 0.4)), inset 4px 4px 40px var(--glow-secondary-2, rgba(59, 130, 246, 0.2));
          }
        }
        @keyframes clockwiseGlow3 {
          0% {
            box-shadow: inset 4px -2px 15px var(--glow-tertiary-1, rgba(59, 130, 246, 0.5)), inset 6px -3px 25px var(--glow-tertiary-2, rgba(59, 130, 246, 0.3));
          }
          33% {
            box-shadow: inset 2px 4px 15px var(--glow-tertiary-1, rgba(59, 130, 246, 0.5)), inset 3px 6px 25px var(--glow-tertiary-2, rgba(59, 130, 246, 0.3));
          }
          66% {
            box-shadow: inset -4px 2px 15px var(--glow-tertiary-1, rgba(59, 130, 246, 0.5)), inset -6px 3px 25px var(--glow-tertiary-2, rgba(59, 130, 246, 0.3));
          }
          100% {
            box-shadow: inset 4px -2px 15px var(--glow-tertiary-1, rgba(59, 130, 246, 0.5)), inset 6px -3px 25px var(--glow-tertiary-2, rgba(59, 130, 246, 0.3));
          }
        }
      `}</style>
    </div>
  );
}

function StationMarker({ station }: { station: Station }) {
  const { map } = useMap();
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const router = useRouter();

  const lng = Number.parseFloat(station.longitude ?? "0");
  const lat = Number.parseFloat(station.latitude ?? "0");

  useEffect(() => {
    if (!map) return;

    const el = document.createElement("div");
    el.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-5 lg:size-8 rounded-xl bg-[#facd01] p-1 text-black">
        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
      </svg>
    `;
    el.style.cursor = "pointer";
    el.className = "station-marker";

    const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
      .setLngLat([lng, lat])
      .addTo(map);

    el.addEventListener("click", () => {
      router.push(`/mapa/estaciones/${encodeURIComponent(station.name)}`);
      map.flyTo({
        center: [lng, lat],
        zoom: map.getZoom() < 14 ? 14 : undefined,
        duration: 1000
      });
    });

    markerRef.current = marker;

    return () => {
      marker.remove();
      markerRef.current = null;
    };
  }, [map, lng, lat, router, station.name]);

  return null;
}

function IncidentMarker({
  incident
}: { incident: IncidentWithCoordinates | SearchIncidentsResult[number] }) {
  const { map } = useMap();
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const router = useRouter();

  const lng = Number.parseFloat(incident.longitude ?? "0");
  const lat = Number.parseFloat(incident.latitude ?? "0");

  useEffect(() => {
    if (!map) return;

    const el = document.createElement("div");
    el.style.width = "16px";
    el.style.height = "16px";
    el.style.borderRadius = "50%";
    el.style.border = "2px solid white";
    el.style.backgroundColor = "#dc2626";
    el.style.cursor = "pointer";

    const marker = new maplibregl.Marker({ element: el, anchor: "center" })
      .setLngLat([lng, lat])
      .addTo(map);

    el.addEventListener("click", () => {
      router.push(`/mapa/incidentes/${incident.id}`);
      map.flyTo({
        center: [lng, lat],
        zoom: map.getZoom() < 14 ? 14 : undefined,
        duration: 1000
      });
    });

    markerRef.current = marker;

    return () => {
      marker.remove();
      markerRef.current = null;
    };
  }, [map, lng, lat, incident.id, router]);

  return null;
}
