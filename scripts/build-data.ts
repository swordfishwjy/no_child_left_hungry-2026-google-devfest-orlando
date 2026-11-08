/**
 * Converts the two source CSVs in ../data into typed, pre-ranked JSON
 * consumed by the app. Runs automatically before `dev`, `build` and `test`.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import Papa from "papaparse";
import { cleanRetailerName, titleCase, tractLabel } from "../src/lib/format";
import {
  GROCERY_RADIUS_MI,
  NEARBY_RADIUS_MI,
  haversineMiles,
} from "../src/lib/geo";
import { STORE_TIER } from "../src/lib/tiers";
import type {
  FlagKey,
  FlagValue,
  NearbyRetailer,
  Retailer,
  School,
} from "../src/lib/types";

// Source CSVs live inside the repo (web/data) so CI/Vercel builds can read them.
// Override with DATA_DIR=/abs/path when experimenting with other extracts.
const DATA_DIR = path.resolve(process.env.DATA_DIR ?? path.join(process.cwd(), "data"));
const OUT_DIR = path.resolve(process.cwd(), "src", "data", "generated");
const SCHOOLS_CSV =
  "SchoolFood_Connect_OCPS_All7Flags_Top5.xlsx - All Schools.csv";
const RETAILERS_CSV = "Orange_County_SNAP_Retailers_With_GEOIDs.csv";
const FLAG_COLUMNS: Record<FlagKey, string> = {
  f1: "flag1_high_school_ses",
  f2: "flag2_high_tract_poverty",
  f3: "flag3_lila",
  f4: "flag4_high_tract_snap",
  f5: "flag5_consistent_low_grade",
  f6: "flag6_school_tract_mismatch",
  f7: "flag7_no_snap_grocery_1mile",
};

type Row = Record<string, string>;

function readCsv(file: string): Row[] {
  const text = readFileSync(path.join(DATA_DIR, file), "utf8");
  const { data, errors } = Papa.parse<Row>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.replace(/^﻿/, "").trim(),
  });
  if (errors.length) {
    throw new Error(`${file}: ${errors.map((e) => e.message).join("; ")}`);
  }
  return data;
}

const num = (v: string | undefined): number | null =>
  v == null || v.trim() === "" ? null : Number(v);

const text = (v: string | undefined): string | null => v?.trim() || null;

const flag = (v: string | undefined): FlagValue =>
  v === "1" ? 1 : v === "0" ? 0 : null;

const round = (n: number, digits = 3) => Number(n.toFixed(digits));

function buildRetailers(): Retailer[] {
  return readCsv(RETAILERS_CSV).map((row) => {
    const storeType = row.Store_Type.trim();
    const tier = STORE_TIER[storeType];
    if (!tier) throw new Error(`Unknown store type "${storeType}"`);
    return {
      id: row.Retailer_ID,
      name: cleanRetailerName(row.Store_Name),
      rawName: row.Store_Name.trim(),
      storeType,
      tier,
      lat: Number(row.Latitude),
      lng: Number(row.Longitude),
    };
  });
}

function buildSchools(retailers: Retailer[]): School[] {
  const unranked = readCsv(SCHOOLS_CSV).map((row) => {
    const lat = Number(row.latitude);
    const lng = Number(row.longitude);
    const distances: (NearbyRetailer & { tier: Retailer["tier"] })[] = retailers
      .map((r) => ({
        id: r.id,
        tier: r.tier,
        mi: round(haversineMiles(lat, lng, r.lat, r.lng)),
      }))
      .sort((a, b) => a.mi - b.mi);
    const nearestFull = distances.find((d) => d.tier === "full_grocery");
    const within1 = distances.filter((d) => d.mi <= GROCERY_RADIUS_MI);

    const flags = Object.fromEntries(
      Object.entries(FLAG_COLUMNS).map(([key, col]) => [key, flag(row[col])]),
    ) as Record<FlagKey, FlagValue>;
    const known = Object.values(flags).filter((f) => f != null);
    const primary = (["f1", "f2", "f3", "f4"] as const).reduce(
      (sum, k) => sum + (flags[k] ?? 0),
      0,
    );

    const csvNearest = num(row.nearest_snap_grocery_miles);
    if (
      nearestFull &&
      csvNearest != null &&
      Math.abs(nearestFull.mi - csvNearest) > 0.02
    ) {
      console.warn(
        `[data] ${row.school_name}: nearest grocery ${nearestFull.mi} mi ≠ CSV ${csvNearest} mi`,
      );
    }

    const school: Omit<School, "rank"> = {
      id: row.school_id,
      name: titleCase(row.school_name),
      address: titleCase(row.street_address),
      city: titleCase(row.city),
      zip: row.zip_code,
      lat,
      lng,
      enrollment: num(row.enrollment_2024_25),
      econDisadvantagedPct: (() => {
        const v = num(row.economically_disadvantaged_pct_2024_25);
        return v == null ? null : round(v * 100, 1);
      })(),
      titleI: row.title_i === "Yes",
      grades: {
        y2023: text(row.school_grade_2023_baseline),
        y2024: text(row.school_grade_2024),
        y2025: text(row.school_grade_2025),
      },
      tract: {
        geoid: row.census_tract_geoid,
        label: tractLabel(row.census_tract_geoid),
        povertyPct: num(row.tract_poverty_pct),
        snapPct: num(row.tract_snap_households_pct_acs_2024),
        lila: (() => {
          const v = num(row.tract_lila_halfmile_urban_10mile_rural);
          return v == null ? null : v === 1;
        })(),
      },
      snapRetailers1mi: num(row.snap_retailers_within_1mile) ?? within1.length,
      snapGrocers1mi:
        num(row.snap_grocery_retailers_within_1mile) ??
        within1.filter((d) => d.tier === "full_grocery").length,
      nearestGroceryMi: csvNearest ?? nearestFull?.mi ?? null,
      nearestFullGrocery: nearestFull
        ? { id: nearestFull.id, mi: nearestFull.mi }
        : null,
      flags,
      totalFlags: known.reduce<number>((sum, f) => sum + (f ?? 0), 0),
      primaryFlags: primary,
      hasUnknownFlags: known.length < 7,
      nearby: distances
        .filter((d) => d.mi <= NEARBY_RADIUS_MI)
        .map(({ id, mi }) => ({ id, mi })),
    };
    return { school, csvRank: Number(row.priority_rank) };
  });

  // Priority score = total flags (0–7); ties broken by the CSV's priority_rank.
  return unranked
    .sort(
      (a, b) =>
        b.school.totalFlags - a.school.totalFlags || a.csvRank - b.csvRank,
    )
    .map(({ school }, i) => ({ ...school, rank: i + 1 }));
}

const retailers = buildRetailers();
const schools = buildSchools(retailers);

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(path.join(OUT_DIR, "retailers.json"), JSON.stringify(retailers));
writeFileSync(path.join(OUT_DIR, "schools.json"), JSON.stringify(schools));

console.log(
  `[data] ${schools.length} schools, ${retailers.length} retailers → src/data/generated`,
);
console.log(
  `[data] top 6: ${schools
    .slice(0, 6)
    .map((s) => `#${s.rank} ${s.name} (${s.totalFlags}/7)`)
    .join(", ")}`,
);
