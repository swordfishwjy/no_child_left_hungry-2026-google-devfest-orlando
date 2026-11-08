import {
  ArrowLeft,
  CircleCheck,
  ShoppingBasket,
  TriangleAlert,
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { DrawerShell } from "@/components/drawer/DrawerShell";
import { DrawerSkeleton } from "@/components/drawer/DrawerSkeleton";
import { RetailerList } from "@/components/drawer/RetailerList";
import { TierStackedBar } from "@/components/drawer/TierStackedBar";
import { Breadcrumbs } from "@/components/overlays/Breadcrumbs";
import { TierLegend } from "@/components/overlays/TierLegend";
import { getNearbyRetailers } from "@/lib/data";
import { formatMiles } from "@/lib/format";
import { GROCERY_RADIUS_MI } from "@/lib/geo";
import type { Tier } from "@/lib/types";
import {
  generateSchoolParams,
  resolveSchool,
  schoolMetadata,
} from "../schoolParams";

export const generateStaticParams = generateSchoolParams;

export function generateMetadata({
  params,
}: PageProps<"/schools/[id]/retailers">) {
  return schoolMetadata(params, "Local Food Retailers");
}

const MEASURED = [
  "Straight-line distance from the school to every SNAP-authorized retailer in Orange County.",
  "The Limited SNAP Grocery Options flag is raised when no full-grocery store is within 1 mile.",
];

/** Level 4 — Neighborhood SNAP retailer view. */
async function RetailerAnalysis({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const school = await resolveSchool(params);
  const within1 = getNearbyRetailers(school).filter(
    (r) => r.mi <= GROCERY_RADIUS_MI,
  );
  const counts = within1.reduce<Record<Tier, number>>(
    (acc, r) => ({ ...acc, [r.tier]: acc[r.tier] + 1 }),
    { full_grocery: 0, produce: 0, limited: 0, prepared_meals: 0 },
  );
  const nearestMi = school.nearestGroceryMi;
  const excessPct =
    nearestMi != null && nearestMi > GROCERY_RADIUS_MI
      ? Math.round(((nearestMi - GROCERY_RADIUS_MI) / GROCERY_RADIUS_MI) * 100)
      : null;
  const beyond = excessPct != null;

  return (
    <>
      <Breadcrumbs
        items={[
          { label: "Overview", href: "/" },
          { label: school.name, href: `/schools/${school.id}` },
          { label: "Local Food Retailers" },
        ]}
      />
      <TierLegend schoolId={school.id} />

      <DrawerShell
        label={`${school.name} local food retailers`}
        header={
          <>
            <p className="text-label-sm font-semibold text-brand uppercase">
              SNAP retail access
            </p>
            <h1 className="mt-1 text-headline-md font-semibold tracking-tight text-ink">
              Local Food Retailers
            </h1>
            <p className="text-body-md text-muted">
              {school.name} · SNAP-authorized stores
            </p>
          </>
        }
        footer={
          <div className="flex items-center justify-between gap-3">
            <Link
              href={`/schools/${school.id}`}
              className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-body-md font-semibold text-white transition-colors hover:bg-brand-hover"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Back to School Assessment
            </Link>
            <Link
              href="/"
              className="text-body-md font-medium text-brand hover:underline"
            >
              Back to Top 5
            </Link>
          </div>
        }
      >
        <TierStackedBar
          counts={counts}
          radiusLabel={`${GROCERY_RADIUS_MI} mile`}
        />

        <section className="flex items-center justify-between rounded-xl border border-line bg-canvas p-4">
          <span className="flex items-center gap-2 text-body-md font-semibold text-ink">
            <ShoppingBasket className="size-4 text-tier-full" aria-hidden />
            Nearest grocery store
          </span>
          <span className="text-metric font-bold tracking-tight text-ink tnum">
            {formatMiles(nearestMi)}
          </span>
        </section>

        {beyond ? (
          <section
            aria-label="Insight"
            className="flex gap-3 rounded-xl border border-warn-line bg-warn-bg p-4 text-warn-ink"
          >
            <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden />
            <div>
              <p className="text-label-sm font-semibold uppercase">Insight</p>
              <p className="mt-0.5 text-body-md font-medium tnum">
                {excessPct}% beyond the 1-mile threshold.
              </p>
            </div>
          </section>
        ) : (
          <section
            aria-label="Insight"
            className="flex gap-3 rounded-xl border border-success/30 bg-success/10 p-4 text-success"
          >
            <CircleCheck className="mt-0.5 size-5 shrink-0" aria-hidden />
            <p className="text-body-md font-medium">
              Within the 1-mile threshold.
            </p>
          </section>
        )}

        <section aria-labelledby="measured-title">
          <h3
            id="measured-title"
            className="mb-2 text-label-sm font-semibold text-muted uppercase"
          >
            How this is measured
          </h3>
          <ul className="space-y-2 text-body-sm text-body">
            {MEASURED.map((line) => (
              <li key={line} className="flex gap-2">
                <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-brand" />
                {line}
              </li>
            ))}
          </ul>
        </section>

        <RetailerList schoolId={school.id} />
      </DrawerShell>
    </>
  );
}

/** params are read inside Suspense so the route keeps an instant static shell. */
export default function RetailersPage({
  params,
}: PageProps<"/schools/[id]/retailers">) {
  return (
    <Suspense fallback={<DrawerSkeleton />}>
      <RetailerAnalysis params={params} />
    </Suspense>
  );
}
