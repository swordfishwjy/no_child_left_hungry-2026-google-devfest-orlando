export type Tier = "full_grocery" | "produce" | "limited" | "prepared_meals";

export type FlagKey = "f1" | "f2" | "f3" | "f4" | "f5" | "f6" | "f7";

/** 1 = flagged, 0 = not flagged, null = unknown (missing source data). */
export type FlagValue = 0 | 1 | null;

export interface Retailer {
  id: string;
  /** Display name: store numbers stripped, ALL-CAPS names title-cased. */
  name: string;
  rawName: string;
  storeType: string;
  tier: Tier;
  lat: number;
  lng: number;
}

export interface NearbyRetailer {
  id: string;
  /** Straight-line distance from the school, in miles. */
  mi: number;
}

export interface SchoolGrades {
  y2023: string | null;
  y2024: string | null;
  y2025: string | null;
}

export interface CensusTract {
  geoid: string;
  /** Human tract number, e.g. "151.04". */
  label: string;
  povertyPct: number | null;
  snapPct: number | null;
  lila: boolean | null;
}

export interface School {
  id: string;
  name: string;
  address: string;
  city: string;
  zip: string;
  lat: number;
  lng: number;
  enrollment: number | null;
  /** 0–100. */
  econDisadvantagedPct: number | null;
  titleI: boolean;
  grades: SchoolGrades;
  tract: CensusTract;
  snapRetailers1mi: number;
  snapGrocers1mi: number;
  nearestGroceryMi: number | null;
  nearestFullGrocery: NearbyRetailer | null;
  flags: Record<FlagKey, FlagValue>;
  /** Sum of known flags (0–7) — the focus score. */
  totalFlags: number;
  primaryFlags: number;
  hasUnknownFlags: boolean;
  /** 1 = highest focus. */
  rank: number;
  /** SNAP retailers within NEARBY_RADIUS_MI, sorted by distance. */
  nearby: NearbyRetailer[];
}
