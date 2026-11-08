import { ArrowLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Fragment } from "react";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="glass absolute top-4 left-4 z-10 flex items-center gap-2 rounded-lg px-3 py-2 text-body-md shadow-card"
    >
      <ArrowLeft className="size-4 text-brand" aria-hidden />
      {items.map((item, i) => (
        <Fragment key={item.label}>
          {i > 0 && (
            <ChevronRight className="size-3.5 text-faint" aria-hidden />
          )}
          {item.href ? (
            <Link
              href={item.href}
              className="font-medium text-brand hover:underline"
            >
              {item.label}
            </Link>
          ) : (
            <span aria-current="page" className="font-semibold text-ink">
              {item.label}
            </span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}

/** Census tract context chip shown under the breadcrumb (Levels 3–4). */
export function TractChip({
  label,
  lila,
  povertyPct,
}: {
  label: string;
  lila: boolean | null;
  povertyPct: number | null;
}) {
  return (
    <div className="glass absolute top-16 left-4 z-10 flex items-center gap-2 rounded-lg px-3 py-2 shadow-card">
      <span className="text-label-sm font-semibold text-muted uppercase">
        Census tract
      </span>
      <span className="text-body-md font-semibold text-ink tnum">{label}</span>
      {lila && (
        <span className="rounded-full bg-flag-on/10 px-2 py-0.5 text-label-md font-semibold text-flag-on">
          USDA LILA
        </span>
      )}
      {povertyPct != null && (
        <span className="text-label-md text-muted tnum">
          {povertyPct}% poverty
        </span>
      )}
    </div>
  );
}
