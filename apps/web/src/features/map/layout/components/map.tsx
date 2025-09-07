"use client";

import {
  CR_NE_CORNER,
  CR_SW_CORNER,
  DARK_MAP_STYLE,
  LIGHT_MAP_STYLE
} from "@/features/map/constants";
import { MapFloatingControls } from "@/features/map/layout/components/map-floating-controls";
import type { SearchIncidentsResult } from "@/features/map/search/api/searchRouter";
import { useMapSettings } from "@/features/map/settings/hooks/use-map-settings";
import { cn, isReducedMotion } from "@/features/shared/lib/utils";
import type { IncidentWithCoordinates, Station } from "@/features/trpc";
import { trpc } from "@/features/trpc/client";
import { ShieldIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useCallback } from "react";
import { MapProvider, Marker, Map as ReactMap, useMap } from "react-map-gl/maplibre";

export const InteractiveMap = () => {
  const { resolvedTheme } = useTheme();
  const {
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

  const mapStyleUrl = resolvedTheme === "light" ? LIGHT_MAP_STYLE : DARK_MAP_STYLE;

  type BoundsLike = {
    getSouthWest: () => { lat: number; lng: number };
    getNorthEast: () => { lat: number; lng: number };
  };
  type MapTarget = { getBounds: () => BoundsLike | null | undefined };

  const applyBoundsFromEvent = useCallback(
    (e: { target: MapTarget }) => {
      const bounds = e.target.getBounds();
      if (!bounds) return;
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();
      setViewportBounds({
        minLat: sw.lat,
        minLng: sw.lng,
        maxLat: ne.lat,
        maxLng: ne.lng
      });
    },
    [setViewportBounds]
  );

  const handleMoveEnd = useCallback(
    (e: { target: MapTarget }) => {
      applyBoundsFromEvent(e);
    },
    [applyBoundsFromEvent]
  );

  const handleLoad = useCallback(
    (e: { target: MapTarget }) => {
      applyBoundsFromEvent(e);
    },
    [applyBoundsFromEvent]
  );

  return (
    <div className="flex-1">
      <MapProvider>
        <ReactMap
          maxBounds={
            // [[s,w],[n,e]] bounds
            [
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
              [CR_SW_CORNER[0]!, CR_SW_CORNER[1]!],
              // biome-ignore lint/style/noNonNullAssertion: <explanation>
              [CR_NE_CORNER[0]!, CR_NE_CORNER[1]!]
            ]
          }
          initialViewState={{
            latitude: 9.9670834,
            longitude: -84.1341552,
            zoom: 10,
            bearing: 0,
            pitch: 0
          }}
          mapStyle={mapStyleUrl}
          onMoveEnd={handleMoveEnd}
          onLoad={handleLoad}
        >
          <div
            className={cn(
              "pointer-events-none absolute inset-0 transition-opacity duration-700 ease-in-out",
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
              "pointer-events-none absolute inset-0 transition-opacity duration-700 ease-in-out",
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
              "pointer-events-none absolute inset-0 transition-opacity duration-700 ease-in-out",
              isSearching ? "opacity-100" : "opacity-0"
            )}
            style={{
              boxShadow:
                "inset 0 0 15px var(--glow-tertiary-1, rgba(59, 130, 246, 0.5)), inset 0 0 25px var(--glow-tertiary-2, rgba(59, 130, 246, 0.3))",
              animation: isSearching ? "clockwiseGlow3 1.8s linear infinite" : "none"
            }}
          />
          {stationsData?.map((station) => {
            return <StationMarker key={station.id} station={station} />;
          })}
          {!hideRegularIncidents &&
            incidentsQuery.data?.map((incident) => (
              <IncidentMarker key={incident.id} incident={incident} />
            ))}
          {hideRegularIncidents &&
            searchResults.map((incident) => (
              <IncidentMarker key={incident.id} incident={incident} />
            ))}
          <MapFloatingControls />
        </ReactMap>
        <style jsx>{`
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
      </MapProvider>
    </div>
  );
};

function StationMarker({ station }: { station: Station }) {
  const { current: map } = useMap();

  const handleClick = () => {
    map?.flyTo({
      center: [
        Number.parseFloat(station.longitude ?? "0"),
        Number.parseFloat(station.latitude ?? "0")
      ],
      duration: 2000,
      zoom: map.getZoom() < 14 ? 14 : undefined,
      animate: !isReducedMotion()
    });
  };

  return (
    <Link href={`/mapa/estaciones/${encodeURIComponent(station.name)}`} className="cursor-pointer">
      <Marker
        key={station.id}
        longitude={Number.parseFloat(station.longitude ?? "")}
        latitude={Number.parseFloat(station.latitude ?? "")}
        anchor="bottom"
        onClick={handleClick}
      >
        <ShieldIcon className="size-5 rounded-xl bg-[#facd01] p-1 text-black lg:size-8" />
      </Marker>
    </Link>
  );
}

function IncidentMarker({
  incident
}: { incident: IncidentWithCoordinates | SearchIncidentsResult[number] }) {
  const { current: map } = useMap();

  const handleClick = () => {
    map?.flyTo({
      center: [
        Number.parseFloat(incident.longitude ?? "0"),
        Number.parseFloat(incident.latitude ?? "0")
      ],
      duration: 2000,
      zoom: map.getZoom() < 14 ? 14 : undefined,
      animate: !isReducedMotion()
    });
  };

  return (
    <Link href={`/mapa/incidentes/${incident.id}`} className="cursor-pointer">
      <Marker
        key={incident.id}
        longitude={Number.parseFloat(incident.longitude ?? "0")}
        latitude={Number.parseFloat(incident.latitude ?? "0")}
        anchor="bottom"
        onClick={handleClick}
      >
        <div className="size-4 rounded-full border-2 border-white bg-red-600" />
      </Marker>
    </Link>
  );
}
