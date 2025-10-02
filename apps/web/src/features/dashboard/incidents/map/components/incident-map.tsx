"use client";

import { ArcLayerOverlay } from "@/features/dashboard/incidents/map/components/arc-layer-overlay";
import { IncidentMapControls } from "@/features/dashboard/incidents/map/components/incident-map-controls";
import { IncidentMarker } from "@/features/dashboard/incidents/map/components/incident-marker";
import { StationMarker } from "@/features/dashboard/incidents/map/components/station-marker";
import { StationPopup } from "@/features/dashboard/incidents/map/components/station-popup";
import {
  calculateCenterCoords,
  calculateMaxBounds
} from "@/features/dashboard/incidents/map/lib/bounds";
import { calculateDynamicZoom } from "@/features/dashboard/incidents/map/lib/zoom";
import { DARK_MAP_STYLE, LIGHT_MAP_STYLE } from "@/features/map/constants";
import { TriangleAlertIcon } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type LngLatBoundsLike,
  MapProvider,
  type MapRef,
  Map as ReactMap
} from "react-map-gl/maplibre";

export interface Station {
  latitude: number;
  longitude: number;
  name: string;
}

interface IncidentMapProps {
  latitude: number;
  longitude: number;
  stations: Station[];
}

export default function IncidentMap({ latitude, longitude, stations }: IncidentMapProps) {
  const { resolvedTheme } = useTheme();
  const [activeStation, setActiveStation] = useState<Station | null>(null);
  const mapRef = useRef<MapRef | null>(null);
  const animationRef = useRef<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const ANIMATION_PITCH = 60;
  const ROTATION_SPEED_DEG_PER_SEC = 20;
  const animationStartRef = useRef<number | null>(null);
  const baseBearingRef = useRef<number>(0);

  const mapStyleUrl = resolvedTheme === "light" ? LIGHT_MAP_STYLE : DARK_MAP_STYLE;

  const areCoordinatesValid = latitude !== 0 && longitude !== 0;

  const stopAnimation = useCallback(() => {
    setIsAnimating((prev) => (prev ? false : prev));
  }, []);

  const handleMapClick = (event: { originalEvent?: { target?: EventTarget | null } }) => {
    if (event.originalEvent?.target) {
      const target = event.originalEvent.target;
      if (
        target instanceof Element &&
        (target.classList.contains("maplibregl-canvas") ||
          target.classList.contains("maplibregl-map"))
      ) {
        setActiveStation(null);
      }
    }
  };

  const handleMapClickWithStop = (event: { originalEvent?: { target?: EventTarget | null } }) => {
    const target = event.originalEvent?.target;
    if (
      target instanceof Element &&
      (target.classList.contains("maplibregl-canvas") ||
        target.classList.contains("maplibregl-map"))
    ) {
      stopAnimation();
    }
    handleMapClick(event);
  };

  const centerCoords = useMemo(
    () => calculateCenterCoords(latitude, longitude, stations, areCoordinatesValid),
    [latitude, longitude, stations, areCoordinatesValid]
  );

  const dynamicZoom = useMemo(
    () => calculateDynamicZoom(latitude, longitude, stations),
    [latitude, longitude, stations]
  );

  const maxBounds = useMemo(
    () => calculateMaxBounds(latitude, longitude, stations, areCoordinatesValid),
    [latitude, longitude, stations, areCoordinatesValid]
  );

  useEffect(() => {
    if (!mapLoaded || !areCoordinatesValid) return;
    if (isAnimating) {
      if (animationStartRef.current === null) {
        animationStartRef.current = performance.now();
        const mapObj = mapRef.current?.getMap();
        if (mapObj) baseBearingRef.current = mapObj.getBearing();
      }
      const animate = () => {
        const mapObj = mapRef.current?.getMap();
        if (mapObj && animationStartRef.current !== null) {
          const elapsedMs = performance.now() - animationStartRef.current;
          const deltaDeg = (elapsedMs / 1000) * ROTATION_SPEED_DEG_PER_SEC;
          const bearing = (baseBearingRef.current + deltaDeg) % 360;
          mapObj.setBearing(bearing);
        }
        if (isAnimating) animationRef.current = requestAnimationFrame(animate);
      };
      if (!animationRef.current) animationRef.current = requestAnimationFrame(animate);
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
      animationStartRef.current = null;
    }
    return () => {
      if (animationRef.current && !isAnimating) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
        animationStartRef.current = null;
      }
    };
  }, [isAnimating, areCoordinatesValid, mapLoaded]);

  interface PossiblyUserEvent {
    originalEvent?: unknown;
  }
  const userInteractionStop = useCallback(
    (e: PossiblyUserEvent) => {
      if (e && Object.prototype.hasOwnProperty.call(e, "originalEvent") && e.originalEvent) {
        stopAnimation();
      }
    },
    [stopAnimation]
  );

  return (
    <MapProvider>
      <div className="relative min-h-[400px] overflow-hidden rounded-xl">
        {!areCoordinatesValid && (
          <div className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-sm">
            <div className="mx-4 w-fit rounded-md bg-background/60 px-4 py-3 backdrop-blur-3xl">
              <p className="select-none text-sm">
                <TriangleAlertIcon
                  className="-mt-0.5 me-3 inline-flex text-amber-500"
                  size={16}
                  aria-hidden="true"
                />
                Coordenadas aún no disponibles.
              </p>
            </div>
          </div>
        )}
        <ReactMap
          ref={mapRef}
          onDragStart={userInteractionStop}
          onRotateStart={userInteractionStop}
          onPitchStart={userInteractionStop}
          onZoomStart={userInteractionStop}
          onMoveStart={userInteractionStop}
          onClick={handleMapClickWithStop}
          onLoad={() => {
            const map = mapRef.current?.getMap();
            if (!map) return;
            setMapLoaded(true);
          }}
          initialViewState={{
            latitude: centerCoords.lat,
            longitude: centerCoords.lng,
            zoom: dynamicZoom,
            bearing: 0,
            pitch: 60
          }}
          maxBounds={maxBounds as LngLatBoundsLike}
          style={{
            minHeight: "400px",
            height: "400px",
            display: "flex",
            justifyContent: "center",
            zIndex: 10
          }}
          mapStyle={mapStyleUrl}
        >
          <ArcLayerOverlay
            mapRef={mapRef}
            stations={stations}
            incidentLatitude={latitude}
            incidentLongitude={longitude}
            areCoordinatesValid={areCoordinatesValid}
          />
          {areCoordinatesValid && (
            <IncidentMapControls
              mapRef={mapRef}
              isAnimating={isAnimating}
              onStopAnimation={stopAnimation}
              onToggleAnimation={() => {
                const map = mapRef.current?.getMap();
                if (!map) return;
                if (isAnimating) {
                  setIsAnimating(false);
                  return;
                }
                const targetCenter: [number, number] = [centerCoords.lng, centerCoords.lat];
                const currentCenter = map.getCenter();
                const centerDist = Math.hypot(
                  currentCenter.lng - targetCenter[0],
                  currentCenter.lat - targetCenter[1]
                );
                const currentBearing = map.getBearing();
                const currentPitch = map.getPitch();
                const currentZoom = map.getZoom();
                const bearingDiff = Math.abs(currentBearing - 0);
                const pitchDiff = Math.abs(currentPitch - ANIMATION_PITCH);
                const zoomDiff = Math.abs(currentZoom - dynamicZoom);
                const withinTolerance =
                  centerDist < 0.0005 && bearingDiff < 1 && pitchDiff < 1 && zoomDiff < 0.2;

                const startLoop = () => {
                  baseBearingRef.current = map.getBearing();
                  animationStartRef.current = performance.now();
                  setActiveStation(null);
                  setIsAnimating(true);
                };

                if (withinTolerance) {
                  startLoop();
                } else {
                  const startAfterMove = () => {
                    map.off("moveend", startAfterMove);
                    startLoop();
                  };
                  map.on("moveend", startAfterMove);
                  map.easeTo({
                    center: targetCenter,
                    zoom: dynamicZoom,
                    bearing: 0,
                    pitch: ANIMATION_PITCH,
                    duration: 800,
                    easing: (t) => 1 - (1 - t) ** 3
                  });
                }
              }}
              onResetView={() => {
                const map = mapRef.current?.getMap();
                if (!map) return;
                map.easeTo({
                  center: [centerCoords.lng, centerCoords.lat],
                  zoom: dynamicZoom,
                  bearing: 0,
                  pitch: 0,
                  duration: 600
                });
              }}
            />
          )}
          <style>
            {`
              .station-popup .maplibregl-popup-content {
                padding: 0 !important;
                background: transparent !important;
                box-shadow: none !important;
                border: none !important;
              }
              .station-popup .maplibregl-popup-tip {
                display: none !important;
              }
            `}
          </style>
          <IncidentMarker
            latitude={latitude}
            longitude={longitude}
            areCoordinatesValid={areCoordinatesValid}
          />
          {stations.map((station) => (
            <StationMarker
              key={station.latitude + station.longitude}
              station={station}
              onStationClick={setActiveStation}
              onStopAnimation={stopAnimation}
            />
          ))}
          <StationPopup station={activeStation} onClose={() => setActiveStation(null)} />
        </ReactMap>
      </div>
    </MapProvider>
  );
}
