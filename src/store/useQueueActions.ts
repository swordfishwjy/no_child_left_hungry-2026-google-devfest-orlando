"use client";

import { useCallback } from "react";
import { toast } from "sonner";
import { getActiveTopSchools, getSchool } from "@/lib/data";
import { excludedIdsNow, usePortal, type QueueAction } from "./portal";

const LEAVE_ANIMATION_MS = 450;
const SPOTLIGHT_MS = 5000;

const DONE_TEXT: Record<QueueAction, string> = {
  reviewed: "marked as reviewed",
  focus: "added to My Focus",
};

/**
 * Removes a school from the active Top 5 — "Mark as Reviewed" or "Add to My Focus":
 * animate the pin out, spotlight the school that moves in, toast with Undo.
 */
export function useQueueActions() {
  const dismiss = useCallback((id: string, action: QueueAction) => {
    const school = getSchool(id);
    if (!school) return;
    const store = usePortal.getState();
    const before = getActiveTopSchools(excludedIdsNow());
    store.select(null);
    store.setLeaving({ id, action });

    window.setTimeout(() => {
      const state = usePortal.getState();
      state.dismiss(id, action);
      state.setLeaving(null);

      const after = getActiveTopSchools(excludedIdsNow());
      const newcomer = after.find((s) => !before.some((b) => b.id === s.id));
      if (newcomer) {
        state.setSpotlight(newcomer.id);
        window.setTimeout(() => {
          if (usePortal.getState().spotlightId === newcomer.id) {
            usePortal.getState().setSpotlight(null);
          }
        }, SPOTLIGHT_MS);
      }

      toast(
        `${school.name} (#${school.rank}) ${DONE_TEXT[action]}.${
          newcomer
            ? ` Focus #${newcomer.rank} (${newcomer.name}) loaded to map.`
            : ""
        }`,
        {
          id: `${action}-${id}`,
          action: {
            label: "Undo",
            onClick: () => {
              usePortal.getState().restore(id);
              usePortal.getState().setSpotlight(null);
            },
          },
        },
      );
    }, LEAVE_ANIMATION_MS);
  }, []);

  const restore = useCallback((id: string) => {
    const school = getSchool(id);
    usePortal.getState().restore(id);
    if (school) {
      toast(`${school.name} returned to the map as Focus #${school.rank}.`, {
        id: `restore-${id}`,
      });
    }
  }, []);

  return { dismiss, restore };
}
