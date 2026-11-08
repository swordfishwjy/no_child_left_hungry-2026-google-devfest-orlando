import { CircleCheck, Star, type LucideIcon } from "lucide-react";
import type { QueueAction } from "@/store/portal";

interface QueueMeta {
  /** Header button label. */
  label: string;
  /** Primary CTA in the popover / drawer. */
  cta: string;
  /** Status shown once a school is in this list. */
  status: string;
  panelTitle: string;
  panelSubtitle: string;
  empty: string;
  Icon: LucideIcon;
  /** CSS color for icons / exit animation. */
  color: string;
}

export const QUEUE_META: Record<QueueAction, QueueMeta> = {
  reviewed: {
    label: "Reviewed",
    cta: "Mark as Reviewed",
    status: "Reviewed",
    panelTitle: "Reviewed Schools",
    panelSubtitle: "Restore a school if priorities change.",
    empty: "No schools reviewed yet.",
    Icon: CircleCheck,
    color: "var(--color-success)",
  },
  focus: {
    label: "My Focus",
    cta: "Add to My Focus",
    status: "In My Focus",
    panelTitle: "My Focus List",
    panelSubtitle:
      "Schools you're following up on. Open one or return it to the map.",
    empty: "No schools in My Focus yet.",
    Icon: Star,
    color: "var(--color-focus)",
  },
};
