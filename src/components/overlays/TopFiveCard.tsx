"use client";

import { ArrowUp, ChevronRight, Minus, TriangleAlert } from "lucide-react";
import { slotColor } from "@/lib/data";
import { useActiveTopSchools, usePortal } from "@/store/portal";

/** Level 1 — floating glass card listing the active Top 5. */
export function TopFiveCard() {
  const topSchools = useActiveTopSchools();
  const collapsed = usePortal((s) => s.legendCollapsed);
  const toggle = usePortal((s) => s.toggleLegend);
  const selectedId = usePortal((s) => s.selectedId);
  const spotlightId = usePortal((s) => s.spotlightId);
  const reviewedCount = usePortal((s) => s.reviewed.length);
  const focusCount = usePortal((s) => s.myFocus.length);
  const select = usePortal((s) => s.select);

  if (collapsed) {
    return (
      <button
        type="button"
        onClick={toggle}
        className="glass absolute top-4 left-4 z-10 flex items-center gap-2 rounded-full px-4 py-2 text-body-md font-semibold text-ink shadow-card"
      >
        <TriangleAlert className="size-4 text-rank-1" aria-hidden />
        Top 5
        <ChevronRight className="size-4 text-muted" aria-hidden />
      </button>
    );
  }

  return (
    <section
      aria-labelledby="top-five-title"
      className="glass absolute top-4 left-4 z-10 w-[340px] rounded-xl p-4 shadow-card"
    >
      <div className="flex items-start justify-between border-b border-line pb-3">
        <div>
          <h2
            id="top-five-title"
            className="flex items-center gap-2 text-title-sm font-semibold text-ink"
          >
            <TriangleAlert className="size-4 text-rank-1" aria-hidden />
            Top 5 Focus Schools
          </h2>
          <p className="mt-1 text-body-sm text-muted">
            Ranked by total need flags (0–7). Click a pin or row to investigate.
          </p>
        </div>
        <button
          type="button"
          onClick={toggle}
          aria-label="Collapse Top 5 card"
          className="rounded-md p-1 text-muted hover:bg-canvas"
        >
          <Minus className="size-4" />
        </button>
      </div>

      <ol className="mt-3 space-y-1.5">
        {topSchools.map((school, i) => {
          const isNew = spotlightId === school.id;
          const active = selectedId === school.id;
          return (
            <li key={school.id}>
              <button
                type="button"
                onClick={() => select(active ? null : school.id)}
                aria-pressed={active}
                className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors ${
                  isNew
                    ? "bg-brand-light"
                    : active
                      ? "bg-canvas ring-1 ring-stroke"
                      : "hover:bg-canvas"
                }`}
              >
                <span
                  className="grid size-6 shrink-0 place-items-center rounded-full text-label-md font-bold text-white"
                  style={{ background: slotColor(i + 1) }}
                >
                  {school.rank}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1 truncate text-body-md font-semibold text-ink">
                    {school.name}
                    {isNew && (
                      <ArrowUp
                        className="size-3.5 text-brand"
                        aria-label="New"
                      />
                    )}
                  </span>
                  <span className="block truncate text-label-md text-muted">
                    {isNew
                      ? "Auto-loaded to map"
                      : `${school.city} · ${school.zip}`}
                  </span>
                </span>
                <span className="shrink-0 rounded-md bg-flag-on/10 px-1.5 py-0.5 text-label-md font-semibold text-flag-on tnum">
                  {school.totalFlags}/7
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-3 space-y-2 border-t border-line pt-3">
        <div className="flex items-center justify-between">
          <span className="text-label-sm font-semibold text-muted uppercase">
            Queue progress
          </span>
          <span className="text-label-md font-semibold text-brand tnum">
            {reviewedCount} reviewed · {focusCount} in My Focus
          </span>
        </div>
        <div className="flex items-center gap-3 text-label-md text-muted">
          <span className="flex items-center gap-1.5">
            <span className="size-3 rounded-full bg-rank-1" /> Pin size & color
            = rank
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-faint" /> Other schools
          </span>
        </div>
      </div>
    </section>
  );
}
