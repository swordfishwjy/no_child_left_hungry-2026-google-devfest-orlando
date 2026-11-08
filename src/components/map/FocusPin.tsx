"use client";

import { Marker } from "react-map-gl/maplibre";
import { slotColor } from "@/lib/data";
import type { School } from "@/lib/types";
import type { QueueAction } from "@/store/portal";
import { QUEUE_META } from "../ui/queueMeta";

const PIN_SIZES = [44, 40, 37, 34, 32];

export const pinSize = (slot: number | null) =>
  slot ? (PIN_SIZES[slot - 1] ?? 32) : 32;

interface FocusPinProps {
  school: School;
  /** Position in the active Top 5 (1–5); null for a non-Top-5 school. */
  slot: number | null;
  selected?: boolean;
  dimmed?: boolean;
  /** Exit animation for the action that removed the school from the queue. */
  leaving?: QueueAction;
  spotlight?: boolean;
  onSelect?: () => void;
}

export function FocusPin({
  school,
  slot,
  selected,
  dimmed,
  leaving,
  spotlight,
  onSelect,
}: FocusPinProps) {
  const size = pinSize(slot);
  const exit = leaving ? QUEUE_META[leaving] : null;
  const color = exit ? exit.color : slotColor(slot);

  return (
    <Marker
      longitude={school.lng}
      latitude={school.lat}
      anchor="bottom"
      style={{ zIndex: selected ? 20 : 10 - (slot ?? 6) }}
      onClick={(e) => {
        e.originalEvent.stopPropagation();
        onSelect?.();
      }}
    >
      <button
        type="button"
        aria-label={`Focus #${school.rank}: ${school.name}, ${school.totalFlags} of 7 flags`}
        aria-pressed={selected}
        className="group relative flex flex-col items-center transition-all duration-400 ease-out"
        style={{
          opacity: leaving ? 0 : dimmed ? 0.55 : 1,
          transform: `scale(${leaving ? 0.6 : selected ? 1.12 : 1})`,
          transitionDelay: leaving ? "150ms" : "0ms",
        }}
      >
        {slot === 1 && !leaving && (
          <span
            className="pointer-events-none absolute top-0 animate-halo rounded-full"
            style={{ width: size, height: size, background: color }}
          />
        )}
        {spotlight && (
          <span
            className="pointer-events-none absolute -top-2 animate-ping rounded-full border-4 border-brand"
            style={{ width: size + 16, height: size + 16 }}
          />
        )}
        <span
          className="relative grid place-items-center rounded-full border-2 border-white font-bold text-white shadow-pop"
          style={{
            width: size,
            height: size,
            background: color,
            fontSize: size * 0.4,
            boxShadow: selected
              ? "0 0 0 4px rgb(255 255 255 / 0.9), var(--shadow-focus)"
              : undefined,
          }}
        >
          {exit ? (
            <exit.Icon className="size-1/2" strokeWidth={3} />
          ) : (
            school.rank
          )}
        </span>
        <span
          className="-mt-1 h-2.5 w-1 rounded-b-full"
          style={{ background: color }}
          aria-hidden
        />
      </button>
    </Marker>
  );
}
