"use client";

import { DARK_MAP_STYLE, LIGHT_MAP_STYLE } from "@/map/constants";
import { GarageIcon } from "@phosphor-icons/react/dist/ssr";
import { TriangleAlertIcon, X as XIcon } from "lucide-react";
import "maplibre-gl/dist/maplibre-gl.css";
import { useTheme } from "next-themes";
import { useMemo, useState } from "react";
import {
  Layer,
  type LngLatBoundsLike,
  MapProvider,
  Marker,
  Popup,
  Map as ReactMap,
  Source
} from "react-map-gl/maplibre";

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

  const mapStyleUrl = resolvedTheme === "light" ? LIGHT_MAP_STYLE : DARK_MAP_STYLE;

  const areCoordinatesValid = latitude !== 0 && longitude !== 0;

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

    const margin = 0.03;

    return [
      [minLng - margin, minLat - margin],
      [maxLng + margin, maxLat + margin]
    ];
  }, [latitude, longitude, stations, areCoordinatesValid]);

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
                Coordenadas no disponibles aún.
              </p>
            </div>
          </div>
        )}
        <ReactMap
          initialViewState={{
            latitude: centerCoords.lat,
            longitude: centerCoords.lng,
            zoom: 14,
            bearing: 0,
            pitch: 0
          }}
          maxBounds={maxBounds as LngLatBoundsLike}
          style={{
            height: "400px",
            display: "flex",
            justifyContent: "center",
            zIndex: 10
          }}
          mapStyle={mapStyleUrl}
          onClick={handleMapClick}
        >
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
                onClick={() => setActiveStation(station)}
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
          {areCoordinatesValid && (
            <ArcsLayer stations={stations} incidentLat={latitude} incidentLng={longitude} />
          )}
        </ReactMap>
      </div>
    </MapProvider>
  );
}

function ArcsLayer({
  stations,
  incidentLat,
  incidentLng
}: {
  stations: Array<{ latitude: number; longitude: number }>;
  incidentLat: number;
  incidentLng: number;
}) {
  const geojsonData = useMemo(() => {
    if (!stations.length) return null;

    const arcFeatures = stations.map((station, index) => {
      const coordinates = createArcLine(
        [station.longitude, station.latitude],
        [incidentLng, incidentLat]
      );

      return {
        type: "Feature" as const,
        properties: {
          id: `arc-${index}`,
          stationName: `Station ${index + 1}`
        },
        geometry: {
          type: "LineString" as const,
          coordinates
        }
      };
    });

    return {
      type: "FeatureCollection" as const,
      features: arcFeatures
    };
  }, [stations, incidentLat, incidentLng]);

  if (!geojsonData) return null;

  return (
    <Source id="arcs" type="geojson" data={geojsonData}>
      <Layer
        id="arcs-layer"
        type="line"
        layout={{
          "line-join": "round",
          "line-cap": "round"
        }}
        paint={{
          "line-color": "red",
          "line-width": 2,
          "line-opacity": 0.8,
          "line-dasharray": [2, 2]
        }}
      />
    </Source>
  );
}

/**
 * Generates coordinates for a curved arc line between two geographical points.
 * The curvature is determined by the relative positions of the start and end points.
 *
 * @param start The starting coordinate as `[longitude, latitude]`.
 * @param end The ending coordinate as `[longitude, latitude]`.
 * @param numPoints The number of points to generate for the arc. Defaults to 100.
 * @returns An array of coordinates `[longitude, latitude][]` that form the arc.
 */
function createArcLine(start: [number, number], end: [number, number], numPoints = 20) {
  const coordinates: [number, number][] = [];

  const startLat = (start[1] * Math.PI) / 180;
  const startLng = (start[0] * Math.PI) / 180;
  const endLat = (end[1] * Math.PI) / 180;
  const endLng = (end[0] * Math.PI) / 180;

  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.sin((endLat - startLat) / 2) ** 2 +
          Math.cos(startLat) * Math.cos(endLat) * Math.sin((endLng - startLng) / 2) ** 2
      )
    );

  const yBearing = Math.sin(endLng - startLng) * Math.cos(endLat);
  const xBearing =
    Math.cos(startLat) * Math.sin(endLat) -
    Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLng - startLng);
  const bearing = Math.atan2(yBearing, xBearing);

  const isRight = start[0] < end[0];
  const curvatureDirection = isRight ? -1 : 1;

  const arcHeight = Math.min(d * 0.1, 0.02) * curvatureDirection;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;

    const A = Math.sin((1 - t) * d) / Math.sin(d);
    const B = Math.sin(t * d) / Math.sin(d);

    const x = A * Math.cos(startLat) * Math.cos(startLng) + B * Math.cos(endLat) * Math.cos(endLng);
    const y = A * Math.cos(startLat) * Math.sin(startLng) + B * Math.cos(endLat) * Math.sin(endLng);
    const z = A * Math.sin(startLat) + B * Math.sin(endLat);

    let lat = (Math.atan2(z, Math.sqrt(x ** 2 + y ** 2)) * 180) / Math.PI;
    let lng = (Math.atan2(y, x) * 180) / Math.PI;

    if (i > 0 && i < numPoints) {
      const offsetDistance = arcHeight * Math.sin(Math.PI * t);
      const offsetLat = offsetDistance * Math.cos(bearing + Math.PI / 2) * (180 / Math.PI);
      const offsetLng =
        (offsetDistance * Math.sin(bearing + Math.PI / 2) * (180 / Math.PI)) /
        Math.cos((lat * Math.PI) / 180);

      lat += offsetLat;
      lng += offsetLng;
    }

    coordinates.push([lng, lat]);
  }

  return coordinates;
}
