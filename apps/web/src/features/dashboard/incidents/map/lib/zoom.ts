import { calculateNearestStationDistance } from "@/features/dashboard/incidents/map/lib/distance";

/**
 * Calculate dynamic zoom level based on distance to nearest station
 * @param incidentLat Incident latitude
 * @param incidentLng Incident longitude
 * @param stations Array of station coordinates
 * @returns Appropriate zoom level for the map
 */
export function calculateDynamicZoom(
  incidentLat: number,
  incidentLng: number,
  stations: Array<{ latitude: number; longitude: number }>
): number {
  const nearestDistance = calculateNearestStationDistance(incidentLat, incidentLng, stations);

  if (nearestDistance <= 300) return 18;
  if (nearestDistance <= 800) return 17;
  if (nearestDistance <= 1500) return 16.5;
  if (nearestDistance <= 5000) return 15.5;
  if (nearestDistance <= 15000) return 14;

  return 13;
}

/**
 * Get default zoom level when coordinates are invalid
 */
export function getDefaultZoom(): number {
  return 12;
}
