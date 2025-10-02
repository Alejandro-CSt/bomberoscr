export function areCoordinatesValid(latitude: string, longitude: string) {
  return Number(latitude) !== 0 && Number(longitude) !== 0;
}
