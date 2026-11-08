"use client";

import { ArrowRight, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { getSchool } from "@/lib/data";
import { listKey, usePortal } from "@/store/portal";
import { useQueueActions } from "@/store/useQueueActions";
import { QUEUE_META } from "../ui/queueMeta";

const timeFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

/** Left panel listing Reviewed or My Focus schools (opened from the header). */
export function QueuePanel() {
  const action = usePortal((s) => s.openPanel);
  const setOpenPanel = usePortal((s) => s.setOpenPanel);
  const entries = usePortal((s) => (action ? s[listKey(action)] : null));
  const { restore } = useQueueActions();

  if (!action || !entries) return null;

  const meta = QUEUE_META[action];
  const { Icon } = meta;
  const titleId = `${action}-panel-title`;

  return (
    <aside
      id={`${action}-panel`}
      aria-labelledby={titleId}
      className="absolute top-4 bottom-4 left-4 z-40 flex w-[360px] animate-pop-in flex-col rounded-xl border border-stroke bg-surface shadow-pop"
    >
      <div className="flex items-start justify-between border-b border-line p-4">
        <div>
          <h2
            id={titleId}
            className="flex items-center gap-2 text-title-sm font-semibold text-ink"
          >
            <Icon
              className="size-4"
              style={{ color: meta.color }}
              aria-hidden
            />
            {meta.panelTitle}
          </h2>
          <p className="mt-0.5 text-body-sm text-muted">{meta.panelSubtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setOpenPanel(null)}
          aria-label={`Close ${meta.panelTitle}`}
          className="rounded-md p-1 text-muted hover:bg-canvas"
        >
          <X className="size-4" />
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
          <span
            className="grid size-14 place-items-center rounded-full bg-canvas"
            style={{ color: meta.color }}
          >
            <Icon className="size-7" aria-hidden />
          </span>
          <p className="text-body-md text-muted">{meta.empty}</p>
        </div>
      ) : (
        <ul className="flex-1 space-y-2 overflow-y-auto p-3">
          {[...entries].reverse().map(({ id, at }) => {
            const school = getSchool(id);
            if (!school) return null;
            return (
              <li
                key={id}
                className="flex items-center gap-3 rounded-lg border border-line p-3"
              >
                <span
                  className="grid size-7 shrink-0 place-items-center rounded-full text-label-md font-bold text-white"
                  style={{ background: meta.color }}
                >
                  {school.rank}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body-md font-semibold text-ink">
                    {school.name}
                  </span>
                  <span className="block text-label-md text-muted tnum">
                    {school.totalFlags}/7 flags · {timeFmt.format(at)}
                  </span>
                </span>
                {action === "focus" && (
                  <Link
                    href={`/schools/${id}`}
                    onClick={() => setOpenPanel(null)}
                    aria-label={`Open ${school.name}`}
                    className="rounded-lg border border-stroke p-1.5 text-ink hover:bg-canvas"
                  >
                    <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => restore(id)}
                  className="flex items-center gap-1 rounded-lg border border-stroke px-2.5 py-1.5 text-label-md font-medium text-ink hover:bg-canvas"
                >
                  <RotateCcw className="size-3.5" aria-hidden />
                  {action === "focus" ? "Remove" : "Restore"}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
