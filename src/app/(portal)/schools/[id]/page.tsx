import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { DrawerShell } from "@/components/drawer/DrawerShell";
import { DrawerSkeleton } from "@/components/drawer/DrawerSkeleton";
import { FlagCard } from "@/components/drawer/FlagCard";
import { FocusTile } from "@/components/drawer/FocusTile";
import { QueueActions } from "@/components/drawer/QueueActions";
import { ScoreRing } from "@/components/drawer/ScoreRing";
import { Breadcrumbs, TractChip } from "@/components/overlays/Breadcrumbs";
import { TOP_N, slotColor } from "@/lib/data";
import { FLAGS } from "@/lib/flags";
import {
  generateSchoolParams,
  resolveSchool,
  schoolMetadata,
} from "./schoolParams";

export const generateStaticParams = generateSchoolParams;

export function generateMetadata({ params }: PageProps<"/schools/[id]">) {
  return schoolMetadata(params, "Assessment");
}

/** Level 3 — School assessment drawer. */
async function SchoolAssessment({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const school = await resolveSchool(params);

  return (
    <>
      <Breadcrumbs
        items={[{ label: "Overview", href: "/" }, { label: school.name }]}
      />
      <TractChip
        label={school.tract.label}
        lila={school.tract.lila}
        povertyPct={school.tract.povertyPct}
      />

      <DrawerShell
        label={`${school.name} assessment`}
        header={
          <>
            <Link
              href="/"
              className="-ml-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-body-md font-medium text-muted hover:bg-canvas hover:text-ink"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Back to Top 5
            </Link>
            <h1 className="mt-2 text-headline-md font-semibold tracking-tight text-ink">
              {school.name}
            </h1>
            <p className="text-body-md text-muted tnum">
              {school.city}, FL {school.zip} · {school.enrollment ?? "—"}{" "}
              students
              {school.titleI && " · Title I"}
            </p>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-canvas p-4">
              <div>
                <p className="text-label-sm font-semibold text-muted uppercase">
                  District rank
                </p>
                <span
                  className="mt-1 inline-block rounded-full px-2.5 py-0.5 text-body-md font-bold text-white"
                  style={{
                    background: slotColor(
                      school.rank <= TOP_N ? school.rank : null,
                    ),
                  }}
                >
                  Focus #{school.rank}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <ScoreRing score={school.totalFlags} />
                <div>
                  <p className="text-title-sm font-bold text-flag-on tnum">
                    {school.totalFlags} of 7
                  </p>
                  <p className="text-label-sm font-semibold text-muted uppercase">
                    Need flags
                  </p>
                </div>
              </div>
            </div>
          </>
        }
        footer={<QueueActions schoolId={school.id} />}
      >
        <section aria-labelledby="need-flags">
          <h3
            id="need-flags"
            className="mb-2 flex items-baseline justify-between text-title-sm font-semibold text-ink"
          >
            Need Flags
            <span className="text-label-md font-medium text-muted tnum">
              {school.totalFlags} of {FLAGS.length} flagged
            </span>
          </h3>
          <ul className="space-y-2">
            {FLAGS.map((def) => (
              <FlagCard key={def.key} def={def} school={school} />
            ))}
          </ul>
        </section>

        <FocusTile school={school} />
      </DrawerShell>
    </>
  );
}

/** params are read inside Suspense so the route keeps an instant static shell. */
export default function SchoolPage({ params }: PageProps<"/schools/[id]">) {
  return (
    <Suspense fallback={<DrawerSkeleton />}>
      <SchoolAssessment params={params} />
    </Suspense>
  );
}
