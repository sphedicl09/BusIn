import React, { useMemo } from 'react';
import { estimateETASeconds, formatETA } from '../utils/eta';
export default function BusETA({ busPos, routeWaypoints, options = {} }) {
  const seconds = useMemo(
    () =>
      estimateETASeconds({
        busPos,
        routeWaypoints,
        averageSpeedMps: options.averageSpeedMps ?? 8.33,
        stopDwellSeconds: options.stopDwellSeconds ?? 20,
        stopsIndices: options.stopsIndices ?? [],
        currentIndex: options.currentIndex ?? 0,
      }),
    [
      busPos,
      routeWaypoints,
      options.averageSpeedMps,
      options.stopDwellSeconds,
      options.stopsIndices,
      options.currentIndex,
    ]
  );

  return <span>{formatETA(seconds)}</span>;
}
