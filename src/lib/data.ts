import retailersJson from "@/data/generated/retailers.json";
import schoolsJson from "@/data/generated/schools.json";
import type { Retailer, School } from "./types";

export const TOP_N = 5;

/** All schools, sorted by focus rank (1 = highest). */
export const SCHOOLS = schoolsJson as unknown as School[];
export const RETAILERS = retailersJson as unknown as Retailer[];

const schoolById = new Map(SCHOOLS.map((s) => [s.id, s]));
const retailerById = new Map(RETAILERS.map((r) => [r.id, r]));

export const getSchool = (id: string) => schoolById.get(id);
export const getRetailer = (id: string) => retailerById.get(id);

/** Highest-ranked schools that have not been reviewed. */
export function getActiveTopSchools(
  reviewedIds: ReadonlySet<string>,
  n = TOP_N,
): School[] {
  const result: School[] = [];
  for (const school of SCHOOLS) {
    if (reviewedIds.has(school.id)) continue;
    result.push(school);
    if (result.length === n) break;
  }
  return result;
}

export interface NearbyRetailerDetail extends Retailer {
  mi: number;
}

export function getNearbyRetailers(school: School): NearbyRetailerDetail[] {
  return school.nearby.flatMap(({ id, mi }) => {
    const r = retailerById.get(id);
    return r ? [{ ...r, mi }] : [];
  });
}

/** Rank colors 1–5 (slot in the active Top 5); slate beyond. */
export function slotColor(slot: number | null): string {
  return slot != null && slot >= 1 && slot <= TOP_N
    ? `var(--color-rank-${slot})`
    : "var(--color-muted)";
}
