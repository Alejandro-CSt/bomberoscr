"use client";

import type { Station } from "@/features/dashboard/incidents/map/components/incident-map";
import { GarageIcon } from "@phosphor-icons/react/dist/ssr";
import { Marker } from "react-map-gl/maplibre";

interface StationMarkerProps {
  station: Station;
  onStationClick: (station: Station) => void;
  onStopAnimation: () => void;
}

export function StationMarker({ station, onStationClick, onStopAnimation }: StationMarkerProps) {
  const handleClick = () => {
    onStopAnimation();
    onStationClick(station);
  };

  return (
    <Marker
      key={station.latitude + station.longitude}
      latitude={station.latitude}
      longitude={station.longitude}
      anchor="center"
    >
      <button
        type="button"
        onClick={handleClick}
        className="group relative cursor-pointer rounded-md focus:outline-none focus:ring-2 focus:ring-[#facd01]/70"
        aria-label={`Estación ${station.name}`}
      >
        <GarageIcon className="size-5 rounded-xl bg-[#facd01] p-1 text-black shadow-lg ring-1 ring-black/10 lg:size-8" />
      </button>
    </Marker>
  );
}
