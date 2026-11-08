"use client";

import circle from "@turf/circle";
import { GraduationCap } from "lucide-react";
import { useMemo } from "react";
import { Layer, Marker, Source } from "react-map-gl/maplibre";
import { getNearbyRetailers, getRetailer } from "@/lib/data";
import { formatMiles } from "@/lib/format";
import { GROCERY_RADIUS_MI, NEARBY_RADIUS_MI } from "@/lib/geo";
import { TIER_META } from "@/lib/tiers";
import type { School } from "@/lib/types";
import { usePortal } from "@/store/portal";
import { TierGlyph } from "../ui/TierGlyph";

/** Level 4 — radius rings, nearest-grocery line, and tier-coded retailer pins. */
export function RetailerLayers({ school }: { school: School }) {
  const hiddenTiers = usePortal((s) => s.hiddenTiers);
  const hoveredId = usePortal((s) => s.hoveredRetailerId);
  const hoverRetailer = usePortal((s) => s.hoverRetailer);

  const retailers = useMemo(() => getNearbyRetailers(school), [school]);
  const nearest = school.nearestFullGrocery
    ? getRetailer(school.nearestFullGrocery.id)
    : undefined;

  const rings = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: [GROCERY_RADIUS_MI, NEARBY_RADIUS_MI].map((mi) =>
        circle([school.lng, school.lat], mi, {
          units: "miles",
          steps: 128,
          properties: { mi },
        }),
      ),
    }),
    [school],
  );

  const nearestLine = useMemo(
    () =>
      nearest && {
        type: "Feature" as const,
        properties: {},
        geometry: {
          type: "LineString" as const,
          coordinates: [
            [school.lng, school.lat],
            [nearest.lng, nearest.lat],
          ],
        },
      },
    [nearest, school],
  );

  return (
    <>
      <Source id="rings" type="geojson" data={rings}>
        <Layer
          id="ring-fill"
          type="fill"
          filter={["==", ["get", "mi"], GROCERY_RADIUS_MI]}
          paint={{ "fill-color": "#0f766e", "fill-opacity": 0.05 }}
        />
        <Layer
          id="ring-line"
          type="line"
          paint={{
            "line-color": "#0f766e",
            "line-width": [
              "case",
              ["==", ["get", "mi"], GROCERY_RADIUS_MI],
              2,
              1,
            ],
            "line-opacity": [
              "case",
              ["==", ["get", "mi"], GROCERY_RADIUS_MI],
              0.8,
              0.35,
            ],
            "line-dasharray": [3, 3],
          }}
        />
      </Source>

      {nearestLine && (
        <Source id="nearest-line" type="geojson" data={nearestLine}>
          <Layer
            id="nearest-line"
            type="line"
            // Dotted (round dots) to read differently from the dashed radius rings.
            layout={{ "line-cap": "round" }}
            paint={{
              "line-color": "#0072b2",
              "line-width": 3,
              "line-dasharray": [0, 2],
            }}
          />
        </Source>
      )}

      {nearest && school.nearestFullGrocery && (
        <Marker
          longitude={(school.lng + nearest.lng) / 2}
          latitude={(school.lat + nearest.lat) / 2}
          style={{ zIndex: 5 }}
        >
          <span className="rounded-md bg-surface px-1.5 py-0.5 text-label-md font-semibold text-tier-full shadow-card tnum">
            {formatMiles(school.nearestFullGrocery.mi)}
          </span>
        </Marker>
      )}

      <Marker
        longitude={school.lng}
        latitude={school.lat}
        anchor="bottom"
        style={{ zIndex: 15 }}
      >
        <span className="flex flex-col items-center">
          <span className="grid size-11 place-items-center rounded-full border-2 border-white bg-brand text-white shadow-pop">
            <GraduationCap className="size-5" aria-hidden />
          </span>
          <span
            className="-mt-0.5 h-2 w-1 rounded-b-full bg-brand"
            aria-hidden
          />
        </span>
      </Marker>
      <Marker
        longitude={school.lng}
        latitude={school.lat}
        anchor="top"
        offset={[0, 6]}
        style={{ zIndex: 14 }}
      >
        <span className="rounded-md bg-surface px-2 py-1 text-center text-label-md font-semibold whitespace-nowrap text-ink shadow-card">
          {school.name}
        </span>
      </Marker>

      {retailers
        .filter((r) => !hiddenTiers.includes(r.tier))
        .map((r) => {
          const hovered = hoveredId === r.id;
          const isFull = r.tier === "full_grocery";
          return (
            <Marker
              key={r.id}
              longitude={r.lng}
              latitude={r.lat}
              style={{ zIndex: hovered ? 25 : isFull ? 8 : 6 }}
            >
              <span
                className="relative flex flex-col items-center"
                onMouseEnter={() => hoverRetailer(r.id)}
                onMouseLeave={() => hoverRetailer(null)}
              >
                <span
                  className="transition-transform"
                  style={{ transform: `scale(${hovered ? 1.25 : 1})` }}
                >
                  <TierGlyph tier={r.tier} size={isFull ? 28 : 24} />
                </span>
                {isFull && !hovered && (
                  <span className="absolute top-full mt-1 rounded bg-surface/90 px-1.5 py-0.5 text-label-sm font-semibold whitespace-nowrap text-ink shadow-card">
                    {r.name} ({formatMiles(r.mi)})
                  </span>
                )}
                {hovered && (
                  <span
                    role="tooltip"
                    className="absolute bottom-full mb-2 w-56 animate-pop-in rounded-lg border border-stroke bg-surface p-3 text-left shadow-pop"
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="text-body-md font-semibold text-ink">
                        {r.name}
                      </span>
                      <span
                        className="shrink-0 rounded-full px-2 py-0.5 text-label-sm font-semibold text-white"
                        style={{ background: TIER_META[r.tier].color }}
                      >
                        {TIER_META[r.tier].label}
                      </span>
                    </span>
                    <span className="mt-1 block text-body-sm text-muted">
                      {r.storeType} · SNAP authorized
                    </span>
                    <span className="mt-2 block rounded-md bg-canvas px-2 py-1 text-label-md font-semibold text-brand tnum">
                      {formatMiles(r.mi)} from school
                    </span>
                  </span>
                )}
              </span>
            </Marker>
          );
        })}
    </>
  );
}
