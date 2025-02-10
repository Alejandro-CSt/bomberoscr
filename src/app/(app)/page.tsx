"use client";

import { useMediaQuery } from "@/features/hooks/use-media-query";
import { MapControls, MapSettings } from "@/features/map/components/floating-controls";
import {
  CR_NE_CORNER,
  CR_SW_CORNER,
  DARK_MAP_STYLE,
  LIGHT_MAP_STYLE
} from "@/features/map/constants";
import { useIncidentInfo } from "@/features/map/context/incident-drawer-context";
import { useMapSettings } from "@/features/map/context/map-settings-context";
import { TabName, useActiveStation } from "@/features/map/hooks/use-station";
import { trpc } from "@/lib/trpc/client";
import { isReducedMotion } from "@/lib/utils";
import type { Incident, Station } from "@/server/trpc";
import { ShieldIcon } from "lucide-react";
import { MapProvider, Marker, Map as ReactMap, useMap } from "react-map-gl/maplibre";

export default function Home() {
  const [activeStation, setActiveStation] = useActiveStation();
  const { style, showStations, incidentTimeRange } = useMapSettings();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const allStationsQuery = trpc.stations.getStations.useQuery({ filter: "all" });
  const operativeStationsQuery = trpc.stations.getStations.useQuery({ filter: "operative" });
  const incidentsQuery = trpc.incidents.getIncidentsCoordinates.useQuery({
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
                onClick={() => {
                  setActiveStation({
                    fullScreen: !isMobile,
                    stationKey: station.stationKey,
                    stationName: station.name,
                    tab: isMobile ? null : (activeStation.tab ?? TabName.Details)
                  });
                }}
              />
            );
          })}
          {incidentsQuery.data?.map((incident) => (
            <IncidentMarker key={incident.id} incident={incident} />
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
  onClick
}: {
  station: Station;
  onClick: () => void;
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
        onClick();
      }}
    >
      <ShieldIcon className="size-5 rounded-xl bg-[#facd01] p-1 text-black lg:size-8" />
    </Marker>
  );
}

function IncidentMarker({ incident }: { incident: Incident }) {
  const { current: map } = useMap();
  const { setIncidentId, isDrawerOpen, setIsDrawerOpen } = useIncidentInfo();

  return (
    <Marker
      key={incident.id}
      longitude={Number.parseFloat(incident.longitude ?? "0")}
      latitude={Number.parseFloat(incident.latitude ?? "0")}
      anchor="bottom"
      onClick={() => {
        map?.flyTo({
          center: [
            Number.parseFloat(incident.longitude ?? "0"),
            Number.parseFloat(incident.latitude ?? "0")
          ],
          duration: 2000,
          zoom: map.getZoom() < 14 ? 14 : undefined,
          animate: !isReducedMotion()
        });
        setIncidentId(incident.id);
        if (!isDrawerOpen) setIsDrawerOpen(true);
      }}
    >
      <div className="size-6 rounded-full border-2 border-white bg-red-600" />
    </Marker>
  );
}
