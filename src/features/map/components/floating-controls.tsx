"use client";

import { Button } from "@/features/components/ui/button";
import { DARK_MAP_STYLE, LIGHT_MAP_STYLE } from "@/features/map/constants";
import { useMapStyle } from "@/features/map/context/map-style-provider";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import {
  CompassIcon,
  MapIcon,
  MoonIcon,
  SunIcon,
  XIcon,
  ZoomInIcon,
  ZoomOutIcon
} from "lucide-react";
import { useState } from "react";
import { useMap } from "react-map-gl/maplibre";

export function MapControls() {
  const { current: map } = useMap();

  return (
    <div className="absolute right-4 bottom-12 z-10 hidden rounded-full text-primary-foreground md:block">
      <div className="flex-col items-center rounded-lg border border-white/20 bg-black/45 lg:flex">
        <Button variant="ghost" onClick={() => map?.zoomIn()}>
          <ZoomInIcon className="size-8 rounded-none" />
          <span className="sr-only">Acercar</span>
        </Button>
        <Button variant="ghost" onClick={() => map?.zoomOut()} className="size-12">
          <ZoomOutIcon className="size-8" />
          <span className="sr-only">Alejar</span>
        </Button>
        <Button variant="ghost" onClick={() => map?.resetNorthPitch()}>
          <CompassIcon className="size-8" />
          <span className="sr-only">Centrar norte</span>
        </Button>
      </div>
    </div>
  );
}

export function MapSettings() {
  const { setStyle } = useMapStyle();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div className="absolute top-4 right-4 z-10 rounded-lg border border-white/20 bg-black/45">
          <Button variant="ghost" className="size-12 text-primary-foreground">
            <MapIcon />
            <span className="sr-only">Ajustes del mapa</span>
          </Button>
        </div>
      </PopoverTrigger>
      <PopoverContent className="absolute top-4 right-0 w-80" align="end">
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-zinc-50 p-4 shadow-md">
          <div className="col-span-full flex items-center justify-between">
            <h2 className="col-span-2 font-semibold text-lg">Estilo del mapa</h2>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              <XIcon />
              <span className="sr-only">Cerrar</span>
            </Button>
          </div>
          <Button
            variant={useMapStyle().style === LIGHT_MAP_STYLE ? "default" : "outline"}
            className="w-full justify-center gap-2"
            onClick={() => setStyle(LIGHT_MAP_STYLE)}
          >
            <SunIcon className="h-4 w-4" />
            Claro
          </Button>
          <Button
            variant={useMapStyle().style === DARK_MAP_STYLE ? "default" : "outline"}
            className="w-full justify-center gap-2"
            onClick={() => setStyle(DARK_MAP_STYLE)}
          >
            <MoonIcon className="h-4 w-4" />
            Oscuro
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
