"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/shared/components/ui/button";
import { CompassIcon, Settings2Icon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMap } from "react-map-gl/maplibre";

export function MapFloatingControls() {
  const { current: map } = useMap();
  const pathname = usePathname();

  return (
    <div className="absolute top-6 right-6 z-10 flex flex-col gap-1">
      <div className="flex flex-col items-center rounded-full border bg-background/80 p-0.5 shadow-lg backdrop-blur-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => map?.zoomIn()}
          className="rounded-full hover:bg-accent"
        >
          <ZoomInIcon className="size-4" />
          <span className="sr-only">Acercar</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => map?.zoomOut()}
          className="rounded-full hover:bg-accent"
        >
          <ZoomOutIcon className="size-4" />
          <span className="sr-only">Alejar</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => map?.resetNorthPitch()}
          className="rounded-full hover:bg-accent"
        >
          <CompassIcon className="size-4" />
          <span className="sr-only">Centrar norte</span>
        </Button>
      </div>

      <div className="flex flex-col items-center rounded-full border bg-background/80 p-0.5 shadow-lg backdrop-blur-lg">
        <Button
          variant="ghost"
          size="icon"
          asChild
          className={cn(
            "rounded-full hover:bg-accent",
            pathname.startsWith("/mapa/ajustes") ? "bg-primary text-primary-foreground" : ""
          )}
        >
          <Link prefetch href="/mapa/ajustes">
            <Settings2Icon className="size-4" />
            <span className="sr-only">Opciones</span>
          </Link>
        </Button>
      </div>
    </div>
  );
}
