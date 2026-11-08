"use client";

import { GraduationCap } from "lucide-react";
import { getNearbyRetailers, getSchool } from "@/lib/data";
import { NEARBY_RADIUS_MI } from "@/lib/geo";
import { TIER_META, VISIBLE_TIERS, storeTypesFor } from "@/lib/tiers";
import { usePortal } from "@/store/portal";
import { TierGlyph } from "../ui/TierGlyph";

/** Level 4 — tier legend doubling as filter toggles. */
export function TierLegend({ schoolId }: { schoolId: string }) {
  const hiddenTiers = usePortal((s) => s.hiddenTiers);
  const toggleTier = usePortal((s) => s.toggleTier);
  const school = getSchool(schoolId);
  if (!school) return null;

  const retailers = getNearbyRetailers(school);
  const count = (tier: string) =>
    retailers.filter((r) => r.tier === tier).length;

  return (
    <section
      aria-labelledby="tier-legend-title"
      className="glass absolute bottom-6 left-4 z-10 w-64 rounded-xl p-3 shadow-card"
    >
      <div className="mb-2 flex items-center justify-between">
        <h3
          id="tier-legend-title"
          className="text-label-sm font-semibold text-muted uppercase"
        >
          Food retailer tiers
        </h3>
        <span className="text-label-md text-muted tnum">
          {retailers.length} within {NEARBY_RADIUS_MI} mi
        </span>
      </div>
      <ul className="space-y-1">
        {VISIBLE_TIERS.map((tier) => {
          const visible = !hiddenTiers.includes(tier);
          const tipId = `tier-tip-${tier}`;
          return (
            <li key={tier} className="group relative">
              <span
                id={tipId}
                role="tooltip"
                className="pointer-events-none invisible absolute bottom-0 left-full z-20 ml-3 w-72 rounded-lg border border-stroke bg-surface p-3 opacity-0 shadow-pop transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
              >
                <span className="flex items-center gap-2 text-body-md font-semibold text-ink">
                  <TierGlyph tier={tier} size={18} />
                  {TIER_META[tier].label}
                </span>
                <span className="mt-1 block text-body-sm text-body">
                  {TIER_META[tier].description}
                </span>
                <span className="mt-2 block text-label-sm font-semibold text-muted uppercase">
                  USDA store types
                </span>
                <span className="mt-1 flex flex-wrap gap-1">
                  {storeTypesFor(tier).map((type) => (
                    <span
                      key={type}
                      className="rounded-md bg-canvas px-1.5 py-0.5 text-label-md text-ink"
                    >
                      {type}
                    </span>
                  ))}
                </span>
              </span>
              <button
                type="button"
                onClick={() => toggleTier(tier)}
                aria-pressed={visible}
                aria-describedby={tipId}
                className={`flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-body-md transition-opacity hover:bg-canvas ${
                  visible ? "" : "opacity-40"
                }`}
              >
                <TierGlyph tier={tier} size={20} />
                <span className="flex-1 text-left text-ink">
                  {TIER_META[tier].label}
                </span>
                <span className="font-semibold text-ink tnum">
                  {count(tier)}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-2 space-y-1 border-t border-line pt-2 text-label-md text-muted">
        <p className="flex items-center gap-2">
          <span className="grid size-5 place-items-center rounded-full bg-brand text-white">
            <GraduationCap className="size-3" aria-hidden />
          </span>
          School
        </p>
        <p className="flex items-center gap-2">
          <span className="h-0 w-5 border-t-2 border-dashed border-brand" />
          1-mile grocery threshold
        </p>
        <p className="flex items-center gap-2">
          <span className="h-0 w-5 border-t-[3px] border-dotted border-tier-full" />
          Nearest full grocery
        </p>
      </div>
    </section>
  );
}
