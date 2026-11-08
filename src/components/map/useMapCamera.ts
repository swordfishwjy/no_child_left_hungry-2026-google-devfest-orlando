"use client";

import { useEffect, type RefObject } from "react";
import type { MapRef } from "react-map-gl/maplibre";
import {
  NEARBY_RADIUS_MI,
  boundsAround,
  boundsOf,
  type Bounds,
} from "@/lib/geo";
import type { School } from "@/lib/types";
import type { MapLevel } from "./useMapLevel";

const DRAWER_WIDTH = 420;
const TOP_FIVE_CARD_WIDTH = 340;

const reducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Map padding is kept at 0 at all times; drawer/card occlusion is handled
 * per move via cameraForBounds padding or flyTo offset, so camera state never
 * leaks between levels.
 */
function flyToBounds(
  map: MapRef,
  bounds: Bounds,
  padding: { top: number; right: number; bottom: number; left: number },
  opts: { maxZoom: number; duration: number },
) {
  const camera = map.cameraForBounds(bounds, {
    padding,
    maxZoom: opts.maxZoom,
  });
  if (!camera) return;
  map.flyTo({
    ...camera,
    duration: reducedMotion() ? 0 : opts.duration,
    essential: true,
  });
}

/** Space the Level 2 popover needs above its pin, plus side clearance. */
const POPOVER_CLEARANCE = {
  // popover (~360px with 3 actions) + pin + caret offset
  top: 440,
  side: 160,
  left: TOP_FIVE_CARD_WIDTH + 32,
};

/** Pans just enough so the selected pin's popover isn't clipped by the viewport or Top 5 card. */
export function useKeepPopoverInView(
  mapRef: RefObject<MapRef | null>,
  loaded: boolean,
  selected: School | undefined,
) {
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded || !selected) return;
    const { width } = map.getContainer().getBoundingClientRect();
    const p = map.project([selected.lng, selected.lat]);
    const minX = POPOVER_CLEARANCE.left + POPOVER_CLEARANCE.side;
    const maxX = width - POPOVER_CLEARANCE.side;
    const dx = p.x < minX ? p.x - minX : p.x > maxX ? p.x - maxX : 0;
    const dy = p.y < POPOVER_CLEARANCE.top ? p.y - POPOVER_CLEARANCE.top : 0;
    if (dx || dy) {
      map.panBy([dx, dy], { duration: reducedMotion() ? 0 : 500 });
    }
  }, [mapRef, loaded, selected]);
}

export function useMapCamera(
  mapRef: RefObject<MapRef | null>,
  loaded: boolean,
  level: MapLevel,
  topSchools: School[],
) {
  const schoolId = level.kind === "overview" ? null : level.school.id;
  const topKey = topSchools.map((s) => s.id).join(",");

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;

    if (level.kind === "overview") {
      if (!topSchools.length) return;
      flyToBounds(
        map,
        boundsOf(topSchools),
        { top: 96, bottom: 96, left: TOP_FIVE_CARD_WIDTH + 64, right: 96 },
        { maxZoom: 12.5, duration: 1200 },
      );
      return;
    }

    const { school } = level;
    if (level.kind === "school") {
      map.flyTo({
        center: [school.lng, school.lat],
        zoom: 12.8,
        offset: [-DRAWER_WIDTH / 2, 0],
        duration: reducedMotion() ? 0 : 1200,
        essential: true,
      });
      return;
    }

    flyToBounds(
      map,
      boundsAround(school.lat, school.lng, NEARBY_RADIUS_MI),
      { top: 32, bottom: 32, left: 32, right: DRAWER_WIDTH + 32 },
      { maxZoom: 15, duration: 1400 },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed on ids, not object identity
  }, [loaded, level.kind, schoolId, topKey]);
}
