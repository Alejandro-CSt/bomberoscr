"use client";

import { Button } from "@/features/components/ui/button";
import { useMap } from "@/features/map/context/map-provider";
import { CompassIcon, Layers3Icon, SettingsIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";

export default function FloatingControls() {
  const { zoomIn, zoomOut, centerBearing } = useMap();

  return (
    <div className="absolute top-4 right-4 z-10 rounded-full lg:top-8 lg:right-8">
      <div className="flex flex-col items-start gap-4">
        <div className="flex flex-col items-center rounded-lg border border-white/20 bg-black/45">
          <Button variant="ghost" onClick={zoomIn}>
            <ZoomInIcon className="size-8 rounded-none" />
            <span className="sr-only">Acercar</span>
          </Button>
          <Button variant="ghost" onClick={zoomOut} className="size-12">
            <ZoomOutIcon className="size-8" />
            <span className="sr-only">Alejar</span>
          </Button>
          <Button variant="ghost" onClick={centerBearing}>
            <CompassIcon className="size-8" />
            <span className="sr-only">Centrar norte</span>
          </Button>
        </div>
        <div className="flex flex-col items-center rounded-lg border border-white/20 bg-black/45">
          <Button variant="ghost" onClick={centerBearing}>
            <Layers3Icon className="size-8" />
            <span className="sr-only">Centrar norte</span>
          </Button>
          <Button variant="ghost" onClick={centerBearing}>
            <SettingsIcon className="size-8" />
            <span className="sr-only">Centrar norte</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
