"use client";

import { Fragment } from "react";
import { getNearbyRetailers, getSchool } from "@/lib/data";
import { formatMiles } from "@/lib/format";
import { GROCERY_RADIUS_MI } from "@/lib/geo";
import { usePortal } from "@/store/portal";
import { TierGlyph } from "../ui/TierGlyph";

/** Retailers ordered by proximity, synced with map hover. */
export function RetailerList({ schoolId }: { schoolId: string }) {
  const hoveredId = usePortal((s) => s.hoveredRetailerId);
  const hoverRetailer = usePortal((s) => s.hoverRetailer);
  const hiddenTiers = usePortal((s) => s.hiddenTiers);
  const school = getSchool(schoolId);
  if (!school) return null;

  const retailers = getNearbyRetailers(school).filter(
    (r) => !hiddenTiers.includes(r.tier),
  );
  const thresholdIndex = retailers.findIndex((r) => r.mi > GROCERY_RADIUS_MI);

  return (
    <section aria-labelledby="retailer-list-title">
      <div className="mb-2 flex items-center justify-between">
        <h3
          id="retailer-list-title"
          className="text-label-sm font-semibold text-muted uppercase"
        >
          Retailers ordered by proximity
        </h3>
        <span className="text-label-md font-medium text-brand tnum">
          {retailers.length} shown
        </span>
      </div>
      <ul className="space-y-1.5">
        {retailers.map((r, i) => (
          <Fragment key={r.id}>
            {i === thresholdIndex && (
              <li
                aria-hidden
                className="flex items-center gap-2 py-1 text-label-sm font-semibold text-muted uppercase"
              >
                <span className="h-px flex-1 bg-stroke" />
                {GROCERY_RADIUS_MI.toFixed(1)} mile threshold
                <span className="h-px flex-1 bg-stroke" />
              </li>
            )}
            <li
              onMouseEnter={() => hoverRetailer(r.id)}
              onMouseLeave={() => hoverRetailer(null)}
              className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
                hoveredId === r.id
                  ? "border-brand bg-brand-light/50"
                  : "border-line bg-surface"
              }`}
            >
              <TierGlyph tier={r.tier} size={24} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body-md font-semibold text-ink">
                  {r.name}
                </span>
                <span className="block text-label-md text-muted">
                  {r.storeType}
                </span>
              </span>
              <span className="rounded-md bg-canvas px-2 py-0.5 text-label-md font-semibold text-ink tnum">
                {formatMiles(r.mi)}
              </span>
            </li>
          </Fragment>
        ))}
        {retailers.length === 0 && (
          <li className="rounded-lg border border-dashed border-stroke p-4 text-center text-body-sm text-muted">
            No retailers match the selected tiers.
          </li>
        )}
      </ul>
    </section>
  );
}
