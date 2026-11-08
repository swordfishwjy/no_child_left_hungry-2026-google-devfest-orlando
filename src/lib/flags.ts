import { formatMiles, formatPct } from "./format";
import type { FlagKey, School } from "./types";

export interface FlagDef {
  key: FlagKey;
  label: string;
  /** One-line plain-language explanation shown under the label. */
  explanation: string;
  /** The school's value for this indicator, formatted for display. */
  value: (s: School) => string;
  /** Threshold / rule the value is compared against; omitted when not shown. */
  threshold?: (s: School) => string;
}

const gradeTrail = (s: School) =>
  [s.grades.y2023, s.grades.y2024, s.grades.y2025]
    .map((g) => g ?? "?")
    .join(" · ");

export const FLAGS: FlagDef[] = [
  {
    key: "f1",
    label: "High Student Economic Disadvantage",
    explanation: "Share of students who are economically disadvantaged.",
    value: (s) => formatPct(s.econDisadvantagedPct),
    threshold: () => "top quartile of OCPS elementary",
  },
  {
    key: "f2",
    label: "High Community Poverty",
    explanation: "Poverty rate of the school's neighborhood (census tract).",
    value: (s) => formatPct(s.tract.povertyPct),
    threshold: () => "≥ 19.4%",
  },
  {
    key: "f3",
    label: "Limited Grocery Access",
    explanation:
      "Neighborhood is low-income and far from a grocery store (USDA LILA tract).",
    value: (s) => (s.tract.lila == null ? "—" : s.tract.lila ? "Yes" : "No"),
    threshold: () => "LILA tract",
  },
  {
    key: "f4",
    label: "High SNAP Participation",
    explanation:
      "Share of neighborhood households receiving SNAP food benefits.",
    value: (s) => formatPct(s.tract.snapPct),
    threshold: () => "≥ 20.1%",
  },
  {
    key: "f5",
    label: "Consistently Low School Performance",
    explanation: "School grade was C or lower for 3 straight years.",
    value: gradeTrail,
    threshold: () => "2023–2025",
  },
  {
    key: "f6",
    label: "School–Community Mismatch",
    explanation:
      "High student need in a neighborhood that doesn't look poor — hidden need.",
    value: (s) =>
      s.flags.f6 === 1 ? "Hidden need" : s.flags.f6 === 0 ? "No" : "—",
  },
  {
    key: "f7",
    label: "Limited SNAP Grocery Options",
    explanation:
      "No SNAP-accepting supermarket or grocery store within 1 mile.",
    value: (s) => `${s.snapGrocers1mi} within 1 mi`,
    threshold: (s) => `nearest ${formatMiles(s.nearestGroceryMi)}`,
  },
];
