"use client";

import type { Station } from "@/features/incidents/map/components/incident-map";
import { X as XIcon } from "lucide-react";
import { Popup } from "react-map-gl/maplibre";

interface StationPopupProps {
  station: Station | null;
  onClose: () => void;
}

export function StationPopup({ station, onClose }: StationPopupProps) {
  if (!station) {
    return null;
  }

  return (
    <Popup
      longitude={station.longitude}
      latitude={station.latitude}
      anchor="top"
      offset={16}
      closeOnMove={false}
      closeOnClick={false}
      focusAfterOpen={false}
      onClose={onClose}
      className="station-popup"
      closeButton={false}
      style={{ zIndex: 50 }}
    >
      <div className="relative rounded-md bg-background/95 px-3 py-2 pr-8 text-sm shadow-lg ring-1 ring-border">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="-translate-y-1/2 absolute top-1/2 right-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-foreground/70 text-background hover:bg-foreground/80"
        >
          <XIcon className="h-3.5 w-3.5" />
        </button>
        <span className="font-medium">Estación </span>
        <span className="font-semibold">{station.name}</span>
      </div>
    </Popup>
  );
}
