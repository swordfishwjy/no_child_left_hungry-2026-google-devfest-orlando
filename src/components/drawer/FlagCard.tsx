import { CircleCheck, CircleHelp, TriangleAlert } from "lucide-react";
import type { FlagDef } from "@/lib/flags";
import type { FlagValue, School } from "@/lib/types";

const STATUS = {
  1: {
    label: "Flagged",
    Icon: TriangleAlert,
    pill: "bg-flag-on/10 text-flag-on",
    card: "border-l-flag-on bg-flag-on/[0.03]",
  },
  0: {
    label: "Not flagged",
    Icon: CircleCheck,
    pill: "bg-flag-off/10 text-flag-off",
    card: "border-l-line",
  },
  unknown: {
    label: "Unknown",
    Icon: CircleHelp,
    pill: "border border-dashed border-stroke text-flag-unknown",
    card: "border-l-line border-dashed",
  },
} as const;

const statusOf = (v: FlagValue) => (v == null ? STATUS.unknown : STATUS[v]);

export function FlagCard({ def, school }: { def: FlagDef; school: School }) {
  const status = statusOf(school.flags[def.key]);
  const { Icon } = status;

  return (
    <li
      className={`rounded-lg border border-line border-l-[3px] p-3 ${status.card}`}
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="text-body-md font-semibold text-ink">{def.label}</h4>
        <span
          className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-label-md font-semibold ${status.pill}`}
        >
          <Icon className="size-3.5" aria-hidden />
          {status.label}
        </span>
      </div>
      <p className="mt-1 text-body-sm text-body tnum">
        Value:{" "}
        <span className="font-semibold text-ink">{def.value(school)}</span>
        {def.threshold && (
          <span className="text-muted"> ({def.threshold(school)})</span>
        )}
      </p>
      <p className="mt-0.5 text-body-sm text-muted">{def.explanation}</p>
    </li>
  );
}
