"use client";

import { MapControls, MapSettings } from "@/features/map/components/floating-controls";
import { CR_NE_CORNER, CR_SW_CORNER } from "@/features/map/constants";
import { useMapStyle } from "@/features/map/context/map-style-provider";
import { useStationInfo } from "@/features/map/context/station-drawer-context";
import { trpc } from "@/lib/trpc/client";
import { isReducedMotion } from "@/lib/utils";
import type { OperativeStation } from "@/server/trpc";
import { ShieldIcon } from "lucide-react";
import { MapProvider, Marker, Map as ReactMap, useMap } from "react-map-gl/maplibre";

export default function Home() {
  const { setStationId: setStation, setIsDrawerOpen, isDrawerOpen } = useStationInfo();
  const stations = trpc.getOperativeStations.useQuery();

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
          mapStyle={useMapStyle().style}
        >
          {stations.data?.map((station) => {
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
      <ShieldIcon className="size-6 rounded-xl bg-[#facd01] p-1 text-black lg:size-8" />
    </Marker>
  );
}
