import { ArrowRight, ShoppingBasket } from "lucide-react";
import Link from "next/link";
import { formatMiles } from "@/lib/format";
import type { School } from "@/lib/types";

/** Level 3 → 4 entry point: Limited SNAP Grocery Options focus tile. */
export function FocusTile({ school }: { school: School }) {
  const flagged = school.flags.f7 === 1;

  return (
    <Link
      href={`/schools/${school.id}/retailers`}
      className="group block rounded-xl border-2 border-focus bg-surface p-4 shadow-[0_0_0_3px_rgb(124_58_237/0.12)] transition-shadow hover:shadow-focus focus-visible:shadow-focus"
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-title-sm font-semibold text-ink">
          <span className="grid size-8 place-items-center rounded-lg bg-focus/10 text-focus">
            <ShoppingBasket className="size-4" aria-hidden />
          </span>
          Limited SNAP Grocery Options
        </span>
        <span
          className={`rounded-full px-2 py-0.5 text-label-sm font-semibold ${
            flagged
              ? "bg-flag-on/10 text-flag-on"
              : "bg-flag-off/10 text-flag-off"
          }`}
        >
          {flagged ? "Flagged" : "Not flagged"}
        </span>
      </div>

      <p className="mt-3 flex items-baseline gap-2">
        <span className="text-metric font-bold tracking-tight text-ink tnum">
          {formatMiles(school.nearestGroceryMi)}
        </span>
        <span className="text-body-sm text-muted">
          to the nearest SNAP grocery store
        </span>
      </p>
      <p className="mt-2 rounded-md bg-canvas px-2 py-1.5 text-body-sm text-body tnum">
        {school.snapRetailers1mi} SNAP retailers within 1 mi ·{" "}
        <span className="font-semibold text-ink">
          {school.snapGrocers1mi} {school.snapGrocers1mi === 1 ? "is a" : "are"}{" "}
          grocery {school.snapGrocers1mi === 1 ? "store" : "stores"}
        </span>
      </p>

      <span className="mt-3 flex items-center gap-1 text-body-md font-semibold text-focus">
        Explore local food retailers
        <ArrowRight
          className="size-4 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </span>
    </Link>
  );
}
