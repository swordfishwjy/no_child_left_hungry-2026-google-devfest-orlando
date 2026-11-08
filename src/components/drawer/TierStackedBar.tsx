import { TIER_META, VISIBLE_TIERS } from "@/lib/tiers";
import type { Tier } from "@/lib/types";

/** Share of SNAP retailers by tier within a radius. */
export function TierStackedBar({
  counts,
  radiusLabel,
}: {
  counts: Record<Tier, number>;
  radiusLabel: string;
}) {
  const total = VISIBLE_TIERS.reduce((sum, t) => sum + counts[t], 0);
  const full = counts.full_grocery;

  return (
    <section className="rounded-xl border border-line bg-canvas p-4">
      <div className="flex items-center justify-between text-body-md">
        <span className="font-semibold text-ink">
          Stores within {radiusLabel}
        </span>
        <span
          className={`font-semibold tnum ${full === 0 ? "text-flag-on" : "text-tier-full"}`}
        >
          {full} full grocery
        </span>
      </div>
      <div
        className="mt-3 flex h-3 overflow-hidden rounded-full bg-line"
        role="img"
        aria-label={VISIBLE_TIERS.map(
          (t) => `${counts[t]} ${TIER_META[t].label}`,
        ).join(", ")}
      >
        {total > 0 &&
          VISIBLE_TIERS.map((t) =>
            counts[t] ? (
              <span
                key={t}
                style={{
                  width: `${(counts[t] / total) * 100}%`,
                  background: TIER_META[t].color,
                }}
              />
            ) : null,
          )}
      </div>
      <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-label-md font-semibold tnum">
        {VISIBLE_TIERS.map((t) => (
          <li key={t} style={{ color: TIER_META[t].color }}>
            {counts[t]} {TIER_META[t].label}
            {total > 0 && ` (${Math.round((counts[t] / total) * 100)}%)`}
          </li>
        ))}
      </ul>
    </section>
  );
}
