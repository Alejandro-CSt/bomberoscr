"use client";

import { DARK_MAP_STYLE, LIGHT_MAP_STYLE } from "@/map/constants";
import { ArcLayer } from "@deck.gl/layers";
import { MapboxOverlay } from "@deck.gl/mapbox";
import { GarageIcon } from "@phosphor-icons/react/dist/ssr";
import { TriangleAlertIcon, X as XIcon } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  type LngLatBoundsLike,
  MapProvider,
  type MapRef,
  Marker,
  Popup,
  Map as ReactMap
} from "react-map-gl/maplibre";
import { IncidentMapControls } from "./incident-map-controls";

interface IncidentMapProps {
  latitude: number;
  longitude: number;
  stations: Array<{
    latitude: number;
    longitude: number;
    name: string;
  }>;
}

export default function IncidentMap({ latitude, longitude, stations }: IncidentMapProps) {
  const { resolvedTheme } = useTheme();
  const [activeStation, setActiveStation] = useState<{
    latitude: number;
    longitude: number;
    name: string;
  } | null>(null);
  const mapRef = useRef<MapRef | null>(null);
  const overlayRef = useRef<MapboxOverlay | null>(null);
  const animationRef = useRef<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const ANIMATION_ZOOM = 12;
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

  const centerCoords = useMemo(() => {
    if (areCoordinatesValid) {
      return { lat: latitude, lng: longitude };
    }
    return {
      lat: stations[0]?.latitude ?? 0,
      lng: stations[0]?.longitude ?? 0
    };
  }, [latitude, longitude, stations, areCoordinatesValid]);

  /**
   * Bounding box that keeps the map centered on the incident and all dispatched stations.
   *
   * - If the incident has valid coordinates, it is included in the calculation.
   * - All dispatched stations are also included.
   * - A 0.03° margin is added around the computed bounds to ensure markers are not clipped.
   * - Falls back to the entire world if no valid points are provided.
   *
   * @returns A {@link LngLatBoundsLike} in the form `[[swLng, swLat], [neLng, neLat]]`.
   */
  const maxBounds = useMemo(() => {
    const points: [number, number][] = [];
    if (areCoordinatesValid) points.push([longitude, latitude]);
    for (const s of stations) points.push([s.longitude, s.latitude]);

    if (points.length === 0) {
      return [
        [-180, -90],
        [180, 90]
      ];
    }

    const lats = points.map((p) => p[1]);
    const lngs = points.map((p) => p[0]);

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const margin = 0.2;

    return [
      [minLng - margin, minLat - margin],
      [maxLng + margin, maxLat + margin]
    ];
  }, [latitude, longitude, stations, areCoordinatesValid]);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (!map || !overlayRef.current) return;

    const overlay = overlayRef.current;
    const validStations = stations.filter(
      (s) => s && Number.isFinite(s.latitude) && Number.isFinite(s.longitude)
    );

    if (!areCoordinatesValid || validStations.length === 0) {
      overlay.setProps({ layers: [] });
      return;
    }

    const layer = new ArcLayer({
      id: "arcs-3d",
      data: validStations,
      getSourcePosition: (d: { longitude: number; latitude: number }) => [d.longitude, d.latitude],
      getTargetPosition: () => [longitude, latitude],
      getHeight: 0.5,
      getWidth: 2,
      getSourceColor: [250, 205, 1],
      getTargetColor: [250, 205, 1],
      greatCircle: true,
      pickable: false,
      numSegments: 64
    });

    overlay.setProps({ layers: [layer] });
  }, [stations, latitude, longitude, areCoordinatesValid]);

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

  useEffect(() => {
    return () => {
      const map = mapRef.current?.getMap();
      const overlay = overlayRef.current;
      if (overlay && map) {
        overlay.setProps({ layers: [] });
        map.removeControl(overlay);
        overlay.finalize();
        overlayRef.current = null;
      }
    };
  }, []);

  return (
    <MapProvider>
      <div className="relative overflow-hidden rounded-xl">
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
            if (!overlayRef.current) {
              overlayRef.current = new MapboxOverlay({ interleaved: true });
              map.addControl(overlayRef.current);

              setTimeout(() => {
                const validStations = stations.filter(
                  (s) => s && Number.isFinite(s.latitude) && Number.isFinite(s.longitude)
                );

                if (areCoordinatesValid && validStations.length > 0) {
                  const layer = new ArcLayer({
                    id: "arcs-3d",
                    data: validStations,
                    getSourcePosition: (d: { longitude: number; latitude: number }) => [
                      d.longitude,
                      d.latitude
                    ],
                    getTargetPosition: () => [longitude, latitude],
                    getHeight: 0.5,
                    getWidth: 2,
                    getSourceColor: [250, 205, 1],
                    getTargetColor: [250, 205, 1],
                    greatCircle: true,
                    pickable: false,
                    numSegments: 64
                  });

                  if (overlayRef.current) {
                    overlayRef.current.setProps({ layers: [layer] });
                  }
                }
              }, 100);
            }
          }}
          initialViewState={{
            latitude: centerCoords.lat,
            longitude: centerCoords.lng,
            zoom: 12,
            bearing: 0,
            pitch: 60
          }}
          maxBounds={maxBounds as LngLatBoundsLike}
          style={{
            height: "400px",
            display: "flex",
            justifyContent: "center",
            zIndex: 10
          }}
          mapStyle={mapStyleUrl}
        >
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
                const zoomDiff = Math.abs(currentZoom - ANIMATION_ZOOM);
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
                    zoom: ANIMATION_ZOOM,
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
                  zoom: ANIMATION_ZOOM,
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
          {areCoordinatesValid && <Marker latitude={latitude} longitude={longitude} />}
          {stations.map((station) => (
            <Marker
              key={station.latitude + station.longitude}
              latitude={station.latitude}
              longitude={station.longitude}
              anchor="center"
            >
              <button
                type="button"
                onClick={() => {
                  stopAnimation();
                  setActiveStation(station);
                }}
                className="group relative cursor-pointer rounded-md focus:outline-none focus:ring-2 focus:ring-[#facd01]/70"
                aria-label={`Estación ${station.name}`}
              >
                <GarageIcon className="size-5 rounded-xl bg-[#facd01] p-1 text-black shadow-lg ring-1 ring-black/10 lg:size-8" />
              </button>
            </Marker>
          ))}
          {activeStation && (
            <Popup
              longitude={activeStation.longitude}
              latitude={activeStation.latitude}
              anchor="top"
              offset={16}
              closeOnMove={false}
              closeOnClick={false}
              focusAfterOpen={false}
              onClose={() => setActiveStation(null)}
              className="station-popup"
              closeButton={false}
              style={{ zIndex: 50 }}
            >
              <div className="relative rounded-md bg-background/95 px-3 py-2 pr-8 text-sm shadow-lg ring-1 ring-border">
                <button
                  type="button"
                  onClick={() => setActiveStation(null)}
                  aria-label="Cerrar"
                  className="-translate-y-1/2 absolute top-1/2 right-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-foreground/70 text-background hover:bg-foreground/80"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </button>
                <span className="font-medium">Estación </span>
                <span className="font-semibold">{activeStation.name}</span>
              </div>
            </Popup>
          )}
        </ReactMap>
      </div>
    </MapProvider>
  );
}
