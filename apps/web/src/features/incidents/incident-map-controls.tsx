"use client";

import { cn } from "@/lib/utils";
import { Compass, Video, VideoOff, ZoomIn, ZoomOut } from "lucide-react";
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
        "pointer-events-auto absolute top-2 right-2 z-30 flex flex-col gap-2",
        className
      )}
    >
      <div className="flex flex-col rounded-md border border-border bg-background/80 p-1 shadow-md backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <IconButton
          label="Acercar"
          onClick={() => zoom(1)}
          disabled={disabled}
          icon={<ZoomIn className="h-4 w-4" />}
        />
        <IconButton
          label="Alejar"
          onClick={() => zoom(-1)}
          disabled={disabled}
          icon={<ZoomOut className="h-4 w-4" />}
        />
        <IconButton
          label="Reiniciar vista"
          onClick={() => {
            onStopAnimation();
            onResetView();
          }}
          disabled={disabled}
          icon={<Compass className="h-4 w-4" />}
        />
        <IconButton
          label={isAnimating ? "Detener animación" : "Iniciar animación"}
          onClick={onToggleAnimation}
          disabled={disabled}
          icon={isAnimating ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
        />
      </div>
    </div>
  );
}

interface IconButtonProps {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
  disabled?: boolean;
}

function IconButton({ label, onClick, icon, disabled }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      disabled={disabled}
      className={cn(
        "mb-0.5 flex h-9 w-9 items-center justify-center rounded-sm text-foreground/80 transition",
        "hover:bg-foreground/5 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[#facd01]/70",
        "active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
      )}
    >
      {icon}
    </button>
  );
}
