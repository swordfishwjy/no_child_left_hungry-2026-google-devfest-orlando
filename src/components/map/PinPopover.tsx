"use client";

import { ArrowRight, MapPin, X } from "lucide-react";
import Link from "next/link";
import { Marker } from "react-map-gl/maplibre";
import { slotColor } from "@/lib/data";
import type { School } from "@/lib/types";
import { usePortal } from "@/store/portal";
import { useQueueActions } from "@/store/useQueueActions";
import { QUEUE_META } from "../ui/queueMeta";
import { pinSize } from "./FocusPin";

/** Level 2 — quick-action card anchored above the selected pin. */
export function PinPopover({ school, slot }: { school: School; slot: number }) {
  const select = usePortal((s) => s.select);
  const { dismiss } = useQueueActions();
  const grades = [school.grades.y2023, school.grades.y2024, school.grades.y2025]
    .map((g) => g ?? "?")
    .join(" / ");

  return (
    <Marker
      longitude={school.lng}
      latitude={school.lat}
      anchor="bottom"
      offset={[0, -(pinSize(slot) + 22)]}
      style={{ zIndex: 30 }}
      onClick={(e) => e.originalEvent.stopPropagation()}
    >
      <div
        role="dialog"
        aria-label={`${school.name} quick actions`}
        className="relative w-72 animate-pop-in cursor-auto rounded-xl border border-stroke bg-surface p-4 text-left shadow-pop"
      >
        <button
          type="button"
          onClick={() => select(null)}
          aria-label="Close"
          className="absolute top-2 right-2 rounded-md p-1 text-muted hover:bg-canvas"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center gap-2 pr-6">
          <span
            className="rounded-full px-2 py-0.5 text-label-sm font-bold text-white uppercase"
            style={{ background: slotColor(slot) }}
          >
            Focus #{school.rank}
          </span>
          <span className="rounded-full bg-flag-on/10 px-2 py-0.5 text-label-md font-semibold text-flag-on tnum">
            {school.totalFlags}/7 flags
          </span>
        </div>

        <h2 className="mt-2 text-headline-md font-semibold tracking-tight text-ink">
          {school.name}
        </h2>
        <p className="mt-1 flex items-center gap-1 text-body-sm text-muted">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          {school.address}, {school.city}, FL {school.zip}
        </p>

        <dl className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-canvas p-3">
          <div>
            <dt className="text-label-sm text-muted uppercase">Enrollment</dt>
            <dd className="text-title-sm font-semibold text-ink tnum">
              {school.enrollment ?? "—"} students
            </dd>
          </div>
          <div className="text-right">
            <dt className="text-label-sm text-muted uppercase">State grade</dt>
            <dd className="text-title-sm font-semibold text-brand tnum">
              {grades}
              <span className="ml-1 text-label-md font-normal text-muted">
                (23–25)
              </span>
            </dd>
          </div>
        </dl>

        <Link
          href={`/schools/${school.id}`}
          onClick={() => select(null)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 text-body-md font-semibold text-white transition-colors hover:bg-brand-hover"
        >
          Investigate Details
          <ArrowRight className="size-4" aria-hidden />
        </Link>
        {(["reviewed", "focus"] as const).map((action) => {
          const { Icon, color, cta } = QUEUE_META[action];
          return (
            <button
              key={action}
              type="button"
              onClick={() => dismiss(school.id, action)}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-stroke bg-surface px-4 py-2.5 text-body-md font-medium text-ink transition-colors hover:bg-canvas"
            >
              <Icon className="size-4" style={{ color }} aria-hidden />
              {cta}
            </button>
          );
        })}

        <span
          className="absolute -bottom-2 left-1/2 size-4 -translate-x-1/2 rotate-45 border-r border-b border-stroke bg-surface"
          aria-hidden
        />
      </div>
    </Marker>
  );
}
