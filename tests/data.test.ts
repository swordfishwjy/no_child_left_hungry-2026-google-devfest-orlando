import { describe, expect, it } from "vitest";
import {
  SCHOOLS,
  getActiveTopSchools,
  getNearbyRetailers,
  getRetailer,
} from "@/lib/data";
import { cleanRetailerName, titleCase, tractLabel } from "@/lib/format";
import { haversineMiles } from "@/lib/geo";
import { STORE_TIER } from "@/lib/tiers";
import { RETAILERS } from "@/lib/data";

const byName = (name: string) => {
  const school = SCHOOLS.find((s) => s.name === name);
  if (!school) throw new Error(`missing ${name}`);
  return school;
};

describe("ranking", () => {
  it("ranks all 139 schools by total flags", () => {
    expect(SCHOOLS).toHaveLength(139);
    SCHOOLS.forEach((s, i) => expect(s.rank).toBe(i + 1));
    for (let i = 1; i < SCHOOLS.length; i++) {
      expect(SCHOOLS[i - 1].totalFlags).toBeGreaterThanOrEqual(
        SCHOOLS[i].totalFlags,
      );
    }
  });

  it("produces the expected Top 5 and #6 replacement", () => {
    expect(getActiveTopSchools(new Set()).map((s) => s.name)).toEqual([
      "Riverside Elementary",
      "Phillis Wheatley Elementary",
      "Lovell Elementary",
      "Eagles Nest Elementary",
      "Lake Gem Elementary",
    ]);
    const lovell = byName("Lovell Elementary");
    const next = getActiveTopSchools(new Set([lovell.id]));
    expect(next.map((s) => s.name)).toContain("Rolling Hills Elementary");
    expect(next).toHaveLength(5);
  });

  it("keeps missing flags as unknown", () => {
    const atwater = byName("Atwater Bay Elementary");
    expect(atwater.flags.f5).toBeNull();
    expect(atwater.hasUnknownFlags).toBe(true);
  });
});

describe("Riverside Elementary (Priority #1)", () => {
  const riverside = byName("Riverside Elementary");

  it("matches source CSV values", () => {
    expect(riverside.totalFlags).toBe(6);
    expect(riverside.primaryFlags).toBe(4);
    expect(riverside.tract.povertyPct).toBe(25.9);
    expect(riverside.tract.snapPct).toBe(25.8);
    expect(riverside.tract.label).toBe("151.04");
    expect(riverside.grades).toEqual({ y2023: "C", y2024: "C", y2025: "C" });
  });

  it("has only limited-tier retailers within 1 mile", () => {
    const within1 = getNearbyRetailers(riverside).filter((r) => r.mi <= 1);
    expect(within1).toHaveLength(3);
    expect(within1.every((r) => r.tier === "limited")).toBe(true);
  });

  it("finds Sacks Grocery Outlets as nearest full grocery at 1.49 mi", () => {
    expect(riverside.nearestFullGrocery?.mi).toBeCloseTo(1.49, 2);
    expect(getRetailer(riverside.nearestFullGrocery!.id)?.name).toBe(
      "Sacks Grocery Outlets Inc.",
    );
  });
});

describe("retailers", () => {
  it("maps every CSV store type to a tier", () => {
    const types = new Set(RETAILERS.map((r) => r.storeType));
    types.forEach((t) => expect(STORE_TIER[t]).toBeDefined());
    expect(RETAILERS).toHaveLength(907);
  });
});

describe("format & geo helpers", () => {
  it("cleans retailer names", () => {
    expect(cleanRetailerName("CIRCLE K 2709760")).toBe("Circle K");
    expect(cleanRetailerName("7-eleven Store #42362a 42362A")).toBe(
      "7-eleven Store",
    );
    expect(cleanRetailerName("Sprouts Farmers Market 677")).toBe(
      "Sprouts Farmers Market",
    );
  });

  it("title-cases addresses and keeps directionals", () => {
    expect(titleCase("3125 PEMBROOK DR")).toBe("3125 Pembrook Dr");
    expect(titleCase("100 SW 2ND ST")).toBe("100 SW 2nd St");
  });

  it("formats tract labels", () => {
    expect(tractLabel("12095015104")).toBe("151.04");
    expect(tractLabel("12095016300")).toBe("163");
  });

  it("computes haversine distance", () => {
    // Orlando City Hall → Lake Eola fountain ≈ 0.36 mi
    expect(haversineMiles(28.5416, -81.3792, 28.5434, -81.3731)).toBeCloseTo(
      0.39,
      1,
    );
  });
});
