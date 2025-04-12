"use client";

import { Button } from "@/features/components/ui/button";
import { CompassIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { useMap } from "react-map-gl/maplibre";

export function MapControls() {
  const { current: map } = useMap();

  return (
    <div className="absolute right-4 bottom-12 z-10 hidden md:block">
      <div className="flex flex-col items-center space-y-2 rounded-full bg-white/10 p-2 shadow-lg backdrop-blur-xs">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => map?.zoomIn()}
          className="rounded-full hover:bg-white/20"
        >
          <ZoomInIcon className="h-5 w-5" />
          <span className="sr-only">Acercar</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => map?.zoomOut()}
          className="rounded-full hover:bg-white/20"
        >
          <ZoomOutIcon className="h-5 w-5" />
          <span className="sr-only">Alejar</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => map?.resetNorthPitch()}
          className="rounded-full hover:bg-white/20"
        >
          <CompassIcon className="h-5 w-5" />
          <span className="sr-only">Centrar norte</span>
        </Button>
      </div>
    </div>
  );
}
