"use client";

import { Apple } from "lucide-react";
import Link from "next/link";
import { SCHOOLS } from "@/lib/data";
import { listKey, usePortal, type QueueAction } from "@/store/portal";
import { QUEUE_META } from "./ui/queueMeta";

const HEADER_ACTIONS: QueueAction[] = ["reviewed", "focus"];

function PanelButton({ action }: { action: QueueAction }) {
  const count = usePortal((s) => s[listKey(action)].length);
  const open = usePortal((s) => s.openPanel === action);
  const setOpenPanel = usePortal((s) => s.setOpenPanel);
  const { Icon, color, label } = QUEUE_META[action];

  return (
    <button
      type="button"
      onClick={() => setOpenPanel(open ? null : action)}
      aria-expanded={open}
      aria-controls={`${action}-panel`}
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-label-md font-medium text-ink shadow-card transition-colors ${
        open
          ? "border-stroke bg-canvas"
          : "border-line bg-surface hover:bg-canvas"
      }`}
    >
      <Icon className="size-4" style={{ color }} aria-hidden />
      {label} ({count})
    </button>
  );
}

export function Header() {
  return (
    <header className="relative z-30 flex h-16 shrink-0 items-center justify-between bg-surface px-6 shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
      <Link href="/" className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-lg bg-brand text-white">
          <Apple className="size-6" aria-hidden />
        </span>
        <span className="flex flex-col">
          <span className="flex items-baseline gap-2">
            <span className="text-headline-md font-semibold tracking-tight text-ink">
              No Child Left Hungry
            </span>
            <span className="text-body-md text-faint">|</span>
            <span className="text-body-md font-medium text-brand">
              Food Support Spatial Portal
            </span>
          </span>
          <span className="flex items-center gap-2">
            <span className="text-body-sm text-muted">
              OCPS Elementary Schools · Orlando, FL
            </span>
            <span className="rounded-full bg-brand-light px-2 py-0.5 text-label-sm font-semibold text-brand-dark">
              {SCHOOLS.length} schools ranked
            </span>
          </span>
        </span>
      </Link>

      <div className="flex items-center gap-2">
        {HEADER_ACTIONS.map((action) => (
          <PanelButton key={action} action={action} />
        ))}
      </div>
    </header>
  );
}
