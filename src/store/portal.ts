import { useMemo } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { getActiveTopSchools } from "@/lib/data";
import type { Tier } from "@/lib/types";

/** Ways a school leaves the active Top 5 queue. */
export type QueueAction = "reviewed" | "focus";

export interface QueueEntry {
  id: string;
  /** Epoch ms when the action was taken. */
  at: number;
}

interface PortalState {
  /** Persisted: schools marked as reviewed, newest last. */
  reviewed: QueueEntry[];
  /** Persisted: schools the user added to My Focus, newest last. */
  myFocus: QueueEntry[];
  /** School whose quick-action popover is open (Level 2). */
  selectedId: string | null;
  /** School playing its exit animation before leaving the queue. */
  leaving: { id: string; action: QueueAction } | null;
  /** School that just entered the Top 5 and is spotlighted. */
  spotlightId: string | null;
  hoveredRetailerId: string | null;
  hiddenTiers: Tier[];
  legendCollapsed: boolean;
  openPanel: QueueAction | null;

  select: (id: string | null) => void;
  setLeaving: (leaving: PortalState["leaving"]) => void;
  setSpotlight: (id: string | null) => void;
  /** Moves a school into `action`'s list (and out of the other one). */
  dismiss: (id: string, action: QueueAction) => void;
  /** Returns a school to the active queue. */
  restore: (id: string) => void;
  hoverRetailer: (id: string | null) => void;
  toggleTier: (tier: Tier) => void;
  toggleLegend: () => void;
  setOpenPanel: (panel: QueueAction | null) => void;
}

const LIST_KEY = { reviewed: "reviewed", focus: "myFocus" } as const;
const without = (list: QueueEntry[], id: string) =>
  list.filter((e) => e.id !== id);

export const usePortal = create<PortalState>()(
  persist(
    (set) => ({
      reviewed: [],
      myFocus: [],
      selectedId: null,
      leaving: null,
      spotlightId: null,
      hoveredRetailerId: null,
      hiddenTiers: [],
      legendCollapsed: false,
      openPanel: null,

      select: (selectedId) => set({ selectedId }),
      setLeaving: (leaving) => set({ leaving }),
      setSpotlight: (spotlightId) => set({ spotlightId }),
      dismiss: (id, action) =>
        set((s) => {
          const reviewed = without(s.reviewed, id);
          const myFocus = without(s.myFocus, id);
          const entry = { id, at: Date.now() };
          return {
            reviewed: action === "reviewed" ? [...reviewed, entry] : reviewed,
            myFocus: action === "focus" ? [...myFocus, entry] : myFocus,
            selectedId: s.selectedId === id ? null : s.selectedId,
          };
        }),
      restore: (id) =>
        set((s) => ({
          reviewed: without(s.reviewed, id),
          myFocus: without(s.myFocus, id),
        })),
      hoverRetailer: (hoveredRetailerId) => set({ hoveredRetailerId }),
      toggleTier: (tier) =>
        set((s) => ({
          hiddenTiers: s.hiddenTiers.includes(tier)
            ? s.hiddenTiers.filter((t) => t !== tier)
            : [...s.hiddenTiers, tier],
        })),
      toggleLegend: () => set((s) => ({ legendCollapsed: !s.legendCollapsed })),
      setOpenPanel: (openPanel) => set({ openPanel }),
    }),
    {
      name: "nclh-portal",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ reviewed: s.reviewed, myFocus: s.myFocus }),
      // v0 stored `{ id, reviewedAt }` and had no My Focus list.
      migrate: (persisted, version) => {
        const state = (persisted ?? {}) as {
          reviewed?: { id: string; reviewedAt?: number; at?: number }[];
          myFocus?: QueueEntry[];
        };
        if (version === 0) {
          return {
            reviewed: (state.reviewed ?? []).map((e) => ({
              id: e.id,
              at: e.at ?? e.reviewedAt ?? Date.now(),
            })),
            myFocus: [],
          };
        }
        return state as Pick<PortalState, "reviewed" | "myFocus">;
      },
      // Rehydrated manually after mount (PortalShell) to avoid SSR mismatches.
      skipHydration: true,
    },
  ),
);

export const listKey = (action: QueueAction) => LIST_KEY[action];

/** Status of one school in the queue. */
export function useQueueStatus(id: string): QueueAction | null {
  return usePortal((s) =>
    s.reviewed.some((e) => e.id === id)
      ? "reviewed"
      : s.myFocus.some((e) => e.id === id)
        ? "focus"
        : null,
  );
}

/** Schools removed from the active queue (reviewed or in My Focus). */
export function useExcludedIds(): ReadonlySet<string> {
  const reviewed = usePortal((s) => s.reviewed);
  const myFocus = usePortal((s) => s.myFocus);
  return useMemo(
    () => new Set([...reviewed, ...myFocus].map((e) => e.id)),
    [reviewed, myFocus],
  );
}

export function useActiveTopSchools() {
  const excluded = useExcludedIds();
  return useMemo(() => getActiveTopSchools(excluded), [excluded]);
}

export const excludedIdsNow = () => {
  const { reviewed, myFocus } = usePortal.getState();
  return new Set([...reviewed, ...myFocus].map((e) => e.id));
};
