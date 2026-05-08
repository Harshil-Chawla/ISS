const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees) => (degrees * Math.PI) / 180;

export function haversineDistanceKm(pointA, pointB) {
  if (!pointA || !pointB) return 0;

  const lat1 = toRadians(Number(pointA.latitude));
  const lat2 = toRadians(Number(pointB.latitude));
  const deltaLat = toRadians(Number(pointB.latitude) - Number(pointA.latitude));
  const deltaLng = toRadians(Number(pointB.longitude) - Number(pointA.longitude));

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function calculateSpeedKmH(previousPosition, currentPosition) {
  if (!previousPosition || !currentPosition) return 0;

  const distance = haversineDistanceKm(previousPosition, currentPosition);
  const timeDiffMs =
    new Date(currentPosition.timestamp).getTime() -
    new Date(previousPosition.timestamp).getTime();
  const timeDiffHours = timeDiffMs / (1000 * 60 * 60);

  if (timeDiffHours <= 0) return 0;
  return distance / timeDiffHours;
}
