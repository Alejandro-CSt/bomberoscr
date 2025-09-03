"use client";

import { Button } from "@/features/shared/components/ui/button";
import { cn } from "@/features/shared/lib/utils";
import { CompassIcon, VideoIcon, VideoOffIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { useCallback } from "react";
import type { MapRef } from "react-map-gl/maplibre";

interface IncidentMapControlsProps {
  mapRef: React.RefObject<MapRef | null>;
  isAnimating: boolean;
  onToggleAnimation: () => void;
  onResetView: () => void;
  onStopAnimation: () => void;
  className?: string;
  disabled?: boolean;
}

export function IncidentMapControls({
  mapRef,
  isAnimating,
  onToggleAnimation,
  onResetView,
  onStopAnimation,
  className,
  disabled
}: IncidentMapControlsProps) {
  const zoom = useCallback(
    (delta: number) => {
      if (disabled) return;
      onStopAnimation();
      const map = mapRef.current?.getMap();
      if (!map) return;
      const currentZoom = map.getZoom();
      map.easeTo({ zoom: currentZoom + delta, duration: 350 });
    },
    [mapRef, disabled, onStopAnimation]
  );

  return (
    <div
      className={cn(
        "pointer-events-auto absolute top-6 right-6 z-10 flex flex-col gap-1",
        className
      )}
    >
      <div className="flex flex-col items-center rounded-full border bg-background/80 p-0.5 shadow-lg backdrop-blur-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => zoom(1)}
          disabled={disabled}
          className="rounded-full hover:bg-accent"
        >
          <ZoomInIcon className="size-4" />
          <span className="sr-only">Acercar</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => zoom(-1)}
          disabled={disabled}
          className="rounded-full hover:bg-accent"
        >
          <ZoomOutIcon className="size-4" />
          <span className="sr-only">Alejar</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            onStopAnimation();
            onResetView();
          }}
          disabled={disabled}
          className="rounded-full hover:bg-accent"
        >
          <CompassIcon className="size-4" />
          <span className="sr-only">Reiniciar vista</span>
        </Button>
      </div>

      <div className="flex flex-col items-center rounded-full border bg-background/80 p-0.5 shadow-lg backdrop-blur-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleAnimation}
          disabled={disabled}
          className="rounded-full hover:bg-accent"
        >
          {isAnimating ? <VideoIcon className="size-4" /> : <VideoOffIcon className="size-4" />}
          <span className="sr-only">{isAnimating ? "Detener animación" : "Iniciar animación"}</span>
        </Button>
      </div>
    </div>
  );
}
