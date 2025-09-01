/**
 * Calculate the distance between two geographic points using the Haversine formula
 * @param lat1 Latitude of first point
 * @param lng1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lng2 Longitude of second point
 * @returns Distance in meters
 */
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371000;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Calculate the distance to the nearest station from an incident
 * @param incidentLat Incident latitude
 * @param incidentLng Incident longitude
 * @param stations Array of station coordinates
 * @returns Distance in meters to the nearest station
 */
export function calculateNearestStationDistance(
  incidentLat: number,
  incidentLng: number,
  stations: Array<{ latitude: number; longitude: number }>
): number {
  const validStations = stations.filter(
    (s) => Number.isFinite(s.latitude) && Number.isFinite(s.longitude)
  );

  if (validStations.length === 0) return Number.POSITIVE_INFINITY;

  let minDistance = Number.POSITIVE_INFINITY;

  for (const station of validStations) {
    const distance = calculateDistance(
      incidentLat,
      incidentLng,
      station.latitude,
      station.longitude
    );
    if (distance < minDistance) {
      minDistance = distance;
    }
  }

  return minDistance;
}
