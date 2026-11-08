const KEEP_UPPER = new Set([
  "N",
  "S",
  "E",
  "W",
  "NE",
  "NW",
  "SE",
  "SW",
  "FL",
  "II",
  "III",
  "IV",
  "LLC",
  "USA",
  "CVS",
]);

export function titleCase(input: string): string {
  return input
    .toLowerCase()
    .split(/(\s+|-|\/)/)
    .map((part) => {
      const upper = part.toUpperCase();
      if (KEEP_UPPER.has(upper) || /^[a-z]&[a-z]$/i.test(part)) return upper;
      return part.charAt(0).toUpperCase() + part.slice(1);
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

const STORE_NUMBER = /^#?\d+[a-z]?$/i;

/** "CIRCLE K 2709760" → "Circle K", "7-eleven 32862B" → "7-eleven". */
export function cleanRetailerName(raw: string): string {
  const tokens = raw.trim().split(/\s+/);
  while (tokens.length > 1 && STORE_NUMBER.test(tokens[tokens.length - 1])) {
    tokens.pop();
  }
  const name = tokens.join(" ");
  return /[a-z]/.test(name) ? name : titleCase(name);
}

/** "12095015104" → "151.04", "12095016300" → "163". */
export function tractLabel(geoid: string): string {
  const tract = geoid.slice(5);
  const base = String(Number(tract.slice(0, 4)));
  const suffix = tract.slice(4);
  return suffix === "00" ? base : `${base}.${suffix}`;
}

export const formatMiles = (mi: number | null) =>
  mi == null ? "—" : `${mi.toFixed(2)} mi`;

export const formatPct = (pct: number | null, digits = 1) =>
  pct == null ? "—" : `${Number.isInteger(pct) ? pct : pct.toFixed(digits)}%`;
