"use client";

import FloatingControls from "@/features/map/components/floating-controls";
import { CR_NE_CORNER, CR_SW_CORNER, LIGHT_MAP_STYLE } from "@/features/map/constants";
import { MapProvider } from "@/features/map/context/map-provider";
import { type MapRef, Marker, Map as ReactMap } from "@vis.gl/react-maplibre";
import { useRef } from "react";

import { useStations } from "@/features/hooks/use-stations";
import { useStationInfo } from "@/features/map/context/station-drawer-context";
import { isReducedMotion } from "@/lib/utils";
import { ShieldIcon } from "lucide-react";
import type { Map as MapType } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function Home() {
  const mapRef = useRef<MapRef>(null);
  const { setStation, setIsDrawerOpen } = useStationInfo();
  const stations = useStations();

  return (
    <div className="h-dvh">
      <MapProvider mapRef={mapRef as React.RefObject<MapRef>}>
        <ReactMap
          ref={mapRef}
          maxBounds={
            // [[sw], [ne]] bounds
            [CR_SW_CORNER, CR_NE_CORNER]
          }
          initialViewState={{
            latitude: 9.9670834,
            longitude: -84.1341552,
            zoom: 10,
            bearing: 0,
            pitch: 0
          }}
          mapStyle={LIGHT_MAP_STYLE}
          attributionControl={false}
        >
          {stations.map((station) => {
            if (station.isOperative)
              return (
                <Marker
                  key={station.id}
                  longitude={station.longitude}
                  latitude={station.latitude}
                  anchor="bottom"
                  onClick={() => {
                    setStation(station);
                    setIsDrawerOpen(true);
                    (mapRef.current?.getMap() as MapType).flyTo({
                      center: [
                        Number.parseFloat(station.longitude ?? "0"),
                        Number.parseFloat(station.latitude ?? "0")
                      ],
                      duration: 2000,
                      zoom: 14,
                      animate: !isReducedMotion()
                    });
                  }}
                >
                  <ShieldIcon className="size-6 rounded-xl bg-[#facd01] p-1 text-black lg:size-8" />
                </Marker>
              );
          })}
        </ReactMap>
        <FloatingControls />
      </MapProvider>
    </div>
  );
}
