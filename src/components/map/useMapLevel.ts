"use client";

import { useParams, usePathname } from "next/navigation";
import { getSchool } from "@/lib/data";
import type { School } from "@/lib/types";

export type MapLevel =
  | { kind: "overview" }
  | { kind: "school"; school: School }
  | { kind: "retailers"; school: School };

/** Derives the progressive-disclosure level from the current route. */
export function useMapLevel(): MapLevel {
  const params = useParams<{ id?: string }>();
  const pathname = usePathname();
  const school = params.id
    ? getSchool(decodeURIComponent(params.id))
    : undefined;

  if (!school) return { kind: "overview" };
  return pathname.endsWith("/retailers")
    ? { kind: "retailers", school }
    : { kind: "school", school };
}
