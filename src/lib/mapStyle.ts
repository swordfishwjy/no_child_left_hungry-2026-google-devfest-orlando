const OPENFREEMAP_POSITRON = "https://tiles.openfreemap.org/styles/positron";

/**
 * Basemap style, in priority order:
 * 1. NEXT_PUBLIC_MAP_STYLE_URL (explicit override)
 * 2. CARTO Positron with NEXT_PUBLIC_CARTO_API_KEY
 * 3. OpenFreeMap Positron (keyless fallback)
 */
export function getMapStyleUrl(): string {
  const override = process.env.NEXT_PUBLIC_MAP_STYLE_URL;
  if (override) return override;

  const key = process.env.NEXT_PUBLIC_CARTO_API_KEY;
  if (key) {
    return `https://basemaps.cartocdn.com/gl/positron-gl-style/style.json?key=${encodeURIComponent(key)}`;
  }
  return OPENFREEMAP_POSITRON;
}
