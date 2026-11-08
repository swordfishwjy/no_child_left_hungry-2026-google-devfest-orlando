import type { Tier } from "./types";

/** USDA SNAP store type → access tier (from docs/app_uiux_draft.pdf). */
export const STORE_TIER: Record<string, Tier> = {
  "Super Store": "full_grocery",
  Supermarket: "full_grocery",
  "Grocery Store": "full_grocery",
  "Farmers and Markets": "produce",
  "Convenience Store": "limited",
  Other: "limited",
  "Specialty Store": "limited",
  "Restaurant Meals Program": "prepared_meals",
};

export type TierShape = "circle" | "square" | "triangle" | "diamond";

export interface TierMeta {
  label: string;
  /** CSS color token (see globals.css @theme). */
  color: string;
  shape: TierShape;
  /** Plain-language definition shown in the legend tooltip. */
  description: string;
}

/** USDA `Store_Type` values that roll up into a tier. */
export const storeTypesFor = (tier: Tier) =>
  Object.entries(STORE_TIER)
    .filter(([, t]) => t === tier)
    .map(([type]) => type);

export const TIER_META: Record<Tier, TierMeta> = {
  full_grocery: {
    label: "Full grocery",
    color: "var(--color-tier-full)",
    shape: "circle",
    description:
      "Sells a full range of fresh and staple foods — produce, meat, dairy, bread.",
  },
  produce: {
    label: "Produce",
    color: "var(--color-tier-produce)",
    shape: "square",
    description:
      "Farmers markets and produce stands selling mainly fresh fruit and vegetables.",
  },
  limited: {
    label: "Limited",
    color: "var(--color-tier-limited)",
    shape: "triangle",
    description:
      "Accepts SNAP but stocks a narrow, mostly packaged range — e.g. gas stations, pharmacies, dollar stores, specialty shops.",
  },
  prepared_meals: {
    label: "Prepared meals",
    color: "var(--color-tier-meals)",
    shape: "diamond",
    description:
      "Restaurants approved to serve prepared meals to eligible SNAP recipients.",
  },
};

/** Tiers shown in legends. `prepared_meals` has no Orange County rows, so it is omitted. */
export const VISIBLE_TIERS: Tier[] = ["full_grocery", "produce", "limited"];
