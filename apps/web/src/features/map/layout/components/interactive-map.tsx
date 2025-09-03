"use client";

import {
  CR_NE_CORNER,
  CR_SW_CORNER,
  DARK_MAP_STYLE,
  LIGHT_MAP_STYLE
} from "@/features/map/constants";
import { MapFloatingControls } from "@/features/map/layout/components/map-floating-controls";
import { useMapSettings } from "@/features/map/layout/context/map-settings-context";
import { isReducedMotion } from "@/features/shared/lib/utils";
import type { IncidentWithCoordinates, Station } from "@/features/trpc";
import { trpc } from "@/features/trpc/client";
import { ShieldIcon } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { MapProvider, Marker, Map as ReactMap, useMap } from "react-map-gl/maplibre";

export const InteractiveMap = () => {
  const { resolvedTheme } = useTheme();
  const { showStations, incidentTimeRange } = useMapSettings();
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
        >
          {stationsData?.map((station) => {
            return <StationMarker key={station.id} station={station} />;
          })}
          {incidentsQuery.data?.map((incident) => (
            <IncidentMarker key={incident.id} incident={incident} />
          ))}
          <MapFloatingControls />
        </ReactMap>
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

function IncidentMarker({ incident }: { incident: IncidentWithCoordinates }) {
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
