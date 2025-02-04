"use client";

import { MapControls, MapSettings } from "@/features/map/components/floating-controls";
import {
  CR_NE_CORNER,
  CR_SW_CORNER,
  DARK_MAP_STYLE,
  LIGHT_MAP_STYLE
} from "@/features/map/constants";
import { useMapSettings } from "@/features/map/context/map-settings-context";
import { useStationInfo } from "@/features/map/context/station-drawer-context";
import { trpc } from "@/lib/trpc/client";
import { isReducedMotion } from "@/lib/utils";
import type { OperativeStation } from "@/server/trpc";
import { ShieldIcon } from "lucide-react";
import { MapProvider, Marker, Map as ReactMap, useMap } from "react-map-gl/maplibre";

export default function Home() {
  const { setStationId: setStation, setIsDrawerOpen, isDrawerOpen } = useStationInfo();
  const { style, showStations, incidentTimeRange } = useMapSettings();
  const allStationsQuery = trpc.getStations.useQuery({ filter: "all" });
  const operativeStationsQuery = trpc.getStations.useQuery({ filter: "operative" });
  const incidentsQuery = trpc.getIncidentsCoordinates.useQuery({
    timeRange: incidentTimeRange
  });
  const stationsData =
    showStations === "none"
      ? []
      : showStations === "operative"
        ? operativeStationsQuery.data
        : allStationsQuery.data;
  const mapStyleUrl = style === "light" ? LIGHT_MAP_STYLE : DARK_MAP_STYLE;

  return (
    <div className="h-dvh">
      <MapProvider>
        <ReactMap
          maxBounds={
            // [[sw], [ne]] bounds
            [
              [CR_SW_CORNER[0], CR_SW_CORNER[1]],
              [CR_NE_CORNER[0], CR_NE_CORNER[1]]
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
            return (
              <StationMarker
                key={station.id}
                station={station}
                setStation={setStation}
                isDrawerOpen={isDrawerOpen}
                setIsDrawerOpen={setIsDrawerOpen}
              />
            );
          })}
          {incidentsQuery.data?.map((incident) => (
            <Marker
              key={incident.id}
              longitude={Number.parseFloat(incident.longitude ?? "0")}
              latitude={Number.parseFloat(incident.latitude ?? "0")}
              anchor="bottom"
            >
              <div className="size-3 rounded-full border-2 border-white bg-red-600" />
            </Marker>
          ))}
          <MapSettings />
          <MapControls />
        </ReactMap>
      </MapProvider>
    </div>
  );
}

function StationMarker({
  station,
  setStation,
  isDrawerOpen,
  setIsDrawerOpen
}: {
  station: OperativeStation;
  setStation: (id: number) => void;
  isDrawerOpen: boolean;
  setIsDrawerOpen: (isOpen: boolean) => void;
}) {
  const { current: map } = useMap();

  return (
    <Marker
      key={station.id}
      longitude={Number.parseFloat(station.longitude ?? "")}
      latitude={Number.parseFloat(station.latitude ?? "")}
      anchor="bottom"
      onClick={() => {
        map?.flyTo({
          center: [
            Number.parseFloat(station.longitude ?? "0"),
            Number.parseFloat(station.latitude ?? "0")
          ],
          duration: 2000,
          zoom: map.getZoom() < 14 ? 14 : undefined,
          animate: !isReducedMotion()
        });
        if (!isDrawerOpen) setIsDrawerOpen(true);
        setStation(station.id);
      }}
    >
      <ShieldIcon className="size-5 rounded-xl bg-[#facd01] p-1 text-black lg:size-8" />
    </Marker>
  );
}
