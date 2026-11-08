const EARTH_RADIUS_MI = 3958.8;
const MI_PER_DEG_LAT = 69.0;

/** Radius used for the Limited SNAP Grocery Options flag (F7). */
export const GROCERY_RADIUS_MI = 1;
/** Radius of the neighborhood retailer view (Level 4). */
export const NEARBY_RADIUS_MI = 2;

const toRad = (deg: number) => (deg * Math.PI) / 180;

export function haversineMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MI * Math.asin(Math.sqrt(h));
}

export type Bounds = [[number, number], [number, number]];

/** [[west, south], [east, north]] box of `radiusMi` around a point. */
export function boundsAround(
  lat: number,
  lng: number,
  radiusMi: number,
): Bounds {
  const dLat = radiusMi / MI_PER_DEG_LAT;
  const dLng = radiusMi / (MI_PER_DEG_LAT * Math.cos(toRad(lat)));
  return [
    [lng - dLng, lat - dLat],
    [lng + dLng, lat + dLat],
  ];
}

export function boundsOf(points: { lat: number; lng: number }[]): Bounds {
  const lngs = points.map((p) => p.lng);
  const lats = points.map((p) => p.lat);
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ];
}

/** Orange County, FL — used for the initial camera before data-driven fits. */
export const ORANGE_COUNTY_BOUNDS: Bounds = [
  [-81.66, 28.35],
  [-81.05, 28.8],
];
