"use client";

import { RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQueueStatus, type QueueAction } from "@/store/portal";
import { useQueueActions } from "@/store/useQueueActions";
import { QUEUE_META } from "../ui/queueMeta";

const ACTIONS: QueueAction[] = ["reviewed", "focus"];

/** Drawer footer: Mark as Reviewed / Add to My Focus, or the current status. */
export function QueueActions({ schoolId }: { schoolId: string }) {
  const router = useRouter();
  const status = useQueueStatus(schoolId);
  const { dismiss, restore } = useQueueActions();

  if (status) {
    const { Icon, color, status: label } = QUEUE_META[status];
    return (
      <div className="flex items-center justify-between rounded-lg bg-canvas px-4 py-2.5 text-body-md">
        <span
          className="flex items-center gap-2 font-semibold"
          style={{ color }}
        >
          <Icon className="size-4" aria-hidden />
          {label}
        </span>
        <button
          type="button"
          onClick={() => restore(schoolId)}
          className="flex items-center gap-1 font-medium text-ink hover:underline"
        >
          <RotateCcw className="size-3.5" aria-hidden />
          Return to map
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {ACTIONS.map((action) => {
        const { Icon, color, cta } = QUEUE_META[action];
        return (
          <button
            key={action}
            type="button"
            onClick={() => {
              dismiss(schoolId, action);
              router.push("/");
            }}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-stroke bg-surface px-4 py-2.5 text-body-md font-semibold text-ink transition-colors hover:bg-canvas"
          >
            <Icon className="size-4" style={{ color }} aria-hidden />
            {cta}
          </button>
        );
      })}
    </div>
  );
}
