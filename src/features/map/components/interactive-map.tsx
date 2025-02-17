"use client";

import { MapControls } from "@/features/map/components/floating-controls";
import { FloatingMenu } from "@/features/map/components/floating-menu";
import {
  CR_NE_CORNER,
  CR_SW_CORNER,
  DARK_MAP_STYLE,
  LIGHT_MAP_STYLE
} from "@/features/map/constants";
import { useMapSettings } from "@/features/map/context/map-settings-context";
import { useActiveIncident } from "@/features/map/hooks/use-active-incident";
import { TabName, useActiveStation } from "@/features/map/hooks/use-active-station";
import { useFloatingMenu } from "@/features/map/hooks/use-floating-menu";
import { trpc } from "@/lib/trpc/client";
import { isReducedMotion } from "@/lib/utils";
import type { IncidentWithCoordinates, Station } from "@/server/trpc";
import { ShieldIcon } from "lucide-react";
import { MapProvider, Marker, Map as ReactMap, useMap } from "react-map-gl/maplibre";

export const InteractiveMap = () => {
  const { style, showStations, incidentTimeRange } = useMapSettings();
  const incidentsQuery = trpc.incidents.getIncidentsCoordinates.useQuery({
    timeRange: incidentTimeRange
  });
  const allStations = trpc.stations.getStations.useQuery({ filter: "all" });
  const operativeStations = trpc.stations.getStations.useQuery({ filter: "operative" });
  const stationsData =
    showStations === "none"
      ? []
      : showStations === "operative"
        ? operativeStations.data
        : allStations.data;
  const mapStyleUrl = style === "light" ? LIGHT_MAP_STYLE : DARK_MAP_STYLE;

  return (
    <MapProvider>
      <ReactMap
        maxBounds={
          // [[s,w],[n,e]] bounds
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
          return <StationMarker key={station.id} station={station} />;
        })}
        {incidentsQuery.data?.map((incident) => (
          <IncidentMarker key={incident.id} incident={incident} />
        ))}
        <FloatingMenu />
        <MapControls />
      </ReactMap>
    </MapProvider>
  );
};

function StationMarker({
  station
}: {
  station: Station;
}) {
  const { current: map } = useMap();
  const [, setFloatingMenu] = useFloatingMenu();
  const [activeStation, setActiveStation] = useActiveStation();
  const [, setActiveIncident] = useActiveIncident();

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
    setActiveIncident(null);
    setFloatingMenu(null);
    setActiveStation({
      stationName: station.name,
      stationKey: station.stationKey,
      tab: !activeStation.tab ? TabName.Incidents : activeStation.tab
    });
  };

  return (
    <Marker
      key={station.id}
      longitude={Number.parseFloat(station.longitude ?? "")}
      latitude={Number.parseFloat(station.latitude ?? "")}
      anchor="bottom"
      onClick={handleClick}
    >
      <ShieldIcon className="size-5 rounded-xl bg-[#facd01] p-1 text-black lg:size-8" />
    </Marker>
  );
}

function IncidentMarker({ incident }: { incident: IncidentWithCoordinates }) {
  const { current: map } = useMap();
  const [, setFloatingMenu] = useFloatingMenu();
  const [, setActiveIncident] = useActiveIncident();
  const [, setActiveStation] = useActiveStation();

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
    setActiveStation(null);
    setFloatingMenu(null);
    setActiveIncident({
      incidentId: incident.id
    });
  };

  return (
    <Marker
      key={incident.id}
      longitude={Number.parseFloat(incident.longitude ?? "0")}
      latitude={Number.parseFloat(incident.latitude ?? "0")}
      anchor="bottom"
      onClick={handleClick}
    >
      <div className="size-4 rounded-full border-2 border-white bg-red-600" />
    </Marker>
  );
}
