"use client";

import { Button } from "@/features/shared/components/ui/button";
import { CompassIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { useMap } from "react-map-gl/maplibre";

export function MapFloatingControls() {
  const { current: map } = useMap();

  return (
    <div className="absolute top-4 right-4 z-10 flex flex-col gap-1 md:top-16 md:right-auto md:left-4">
      <div className="flex flex-col items-center rounded-full border bg-background/80 p-0.5 shadow-lg backdrop-blur-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => map?.zoomIn()}
          className="rounded-full transition-[background] hover:bg-accent"
        >
          <ZoomInIcon className="size-4" />
          <span className="sr-only">Acercar</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => map?.zoomOut()}
          className="rounded-full transition-[background] hover:bg-accent"
        >
          <ZoomOutIcon className="size-4" />
          <span className="sr-only">Alejar</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => map?.resetNorthPitch()}
          className="rounded-full transition-[background] hover:bg-accent"
        >
          <CompassIcon className="size-4" />
          <span className="sr-only">Centrar norte</span>
        </Button>
      </div>
    </div>
  );
}
