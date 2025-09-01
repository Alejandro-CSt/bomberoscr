import type { LngLatBoundsLike } from "react-map-gl/maplibre";

/**
 * Calculate bounding box that includes incident and all stations with margin
 * @param incidentLat Incident latitude
 * @param incidentLng Incident longitude
 * @param stations Array of station coordinates
 * @param areCoordinatesValid Whether incident coordinates are valid
 * @returns LngLatBoundsLike for map bounds
 */
export function calculateMaxBounds(
  incidentLat: number,
  incidentLng: number,
  stations: Array<{ latitude: number; longitude: number }>,
  areCoordinatesValid: boolean
): LngLatBoundsLike {
  const points: [number, number][] = [];

  if (areCoordinatesValid) {
    points.push([incidentLng, incidentLat]);
  }

  for (const station of stations) {
    if (Number.isFinite(station.latitude) && Number.isFinite(station.longitude)) {
      points.push([station.longitude, station.latitude]);
    }
  }

  if (points.length === 0) {
    return [
      [-180, -90],
      [180, 90]
    ];
  }

  const latitudes = points.map((point) => point[1]);
  const longitudes = points.map((point) => point[0]);

  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);

  const margin = 0.2;

  return [
    [minLng - margin, minLat - margin],
    [maxLng + margin, maxLat + margin]
  ];
}

/**
 * Calculate center coordinates for the map
 * @param incidentLat Incident latitude
 * @param incidentLng Incident longitude
 * @param stations Array of station coordinates
 * @param areCoordinatesValid Whether incident coordinates are valid
 * @returns Object with lat and lng properties
 */
export function calculateCenterCoords(
  incidentLat: number,
  incidentLng: number,
  stations: Array<{ latitude: number; longitude: number }>,
  areCoordinatesValid: boolean
): { lat: number; lng: number } {
  if (areCoordinatesValid) {
    return { lat: incidentLat, lng: incidentLng };
  }

  const firstStation = stations[0];
  if (firstStation) {
    return { lat: firstStation.latitude, lng: firstStation.longitude };
  }

  return { lat: 0, lng: 0 };
}
