/**
 * @param {{lat: number, lng: number}} pos1
 * @param {{lat: number, lng: number}} pos2 
 * @returns {number}
 */
function getDistance(pos1, pos2) {
  const R = 6371e3;
  const lat1 = (pos1.lat * Math.PI) / 180;
  const lat2 = (pos2.lat * Math.PI) / 180;
  const deltaLat = ((pos2.lat - pos1.lat) * Math.PI) / 180;
  const deltaLon = ((pos2.lng - pos1.lng) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * 
 * @param {{lat: number, lng: number}} busPos 
 * @param {Array<{lat: number, lng: number}>} routeWaypoint
 * @returns {number}
 */
function findClosestWaypointIndex(busPos, routeWaypoints) {
  let minDistance = Infinity;
  let closestIndex = 0;

  routeWaypoints.forEach((waypoint, index) => {
    const distance = getDistance(busPos, waypoint);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
}

/**
 * @param {object} params
 * @param {{lat: number, lng: number}} params.busPos
 * @param {Array<{lat: number, lng: number}>} params.routeWaypoints
 * @param {number} params.averageSpeedMps
 * @param {number} params.stopDwellSeconds
 * @param {Array<number>} params.stopsIndices
 * @param {number} params.currentIndex
 *Opening
 * @returns {number}
 */
export function estimateETASeconds({
  busPos,
  routeWaypoints,
  averageSpeedMps = 8.33,
  stopDwellSeconds = 20,
  stopsIndices = [],
  currentIndex = 0,
}) {
  if (
    !busPos ||
    !routeWaypoints ||
    !Array.isArray(routeWaypoints) ||
    routeWaypoints.length === 0
  ) {
    return 0;
  }

  
  const relevantWaypoints = routeWaypoints.slice(currentIndex);
  if (relevantWaypoints.length === 0) return 0; 

  const closestIndexInSlice = findClosestWaypointIndex(
    busPos,
    relevantWaypoints
  );
  const actualClosestIndex = closestIndexInSlice + currentIndex;
  let remainingDistance = 0;

  remainingDistance += getDistance(busPos, routeWaypoints[actualClosestIndex]);

  for (let i = actualClosestIndex; i < routeWaypoints.length - 1; i++) {
    remainingDistance += getDistance(routeWaypoints[i], routeWaypoints[i + 1]);
  }

  const validSpeed = averageSpeedMps > 0 ? averageSpeedMps : 8.33;
  const travelTimeSeconds = remainingDistance / validSpeed;

  const remainingStops = stopsIndices.filter(
    (stopIndex) => stopIndex > actualClosestIndex
  );
  const stopTimeSeconds = remainingStops.length * stopDwellSeconds;

  return travelTimeSeconds + stopTimeSeconds;
}

/**
 *
 * @param {number} totalSeconds
 *CSS
 * @returns {string}
 */
export function formatETA(totalSeconds) {
  if (totalSeconds < 0) {
    return "N/A";
  }
  if (totalSeconds < 60) {
    return "<1 min";
  }
  const minutes = Math.round(totalSeconds / 60);
  if (minutes === 1) {
    return "1 min";
  }
  return `${minutes} min`;
}

