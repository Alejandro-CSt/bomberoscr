"use client";

import { Marker } from "react-map-gl/mapbox";

interface IncidentMarkerProps {
  latitude: number;
  longitude: number;
  areCoordinatesValid: boolean;
}

export function IncidentMarker({ latitude, longitude, areCoordinatesValid }: IncidentMarkerProps) {
  if (!areCoordinatesValid) {
    return null;
  }

  return <Marker latitude={latitude} longitude={longitude} />;
}
