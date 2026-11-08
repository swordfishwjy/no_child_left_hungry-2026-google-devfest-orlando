"use client";

import dynamic from "next/dynamic";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";
import { usePortal } from "@/store/portal";
import { Header } from "./Header";
import { QueuePanel } from "./overlays/QueuePanel";

const MapCanvas = dynamic(() => import("./map/MapCanvas"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 animate-pulse bg-line/40" />,
});

export function PortalShell({ children }: { children: ReactNode }) {
  useEffect(() => {
    void usePortal.persist.rehydrate();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const { select, setOpenPanel } = usePortal.getState();
      select(null);
      setOpenPanel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="relative flex h-dvh w-full flex-col overflow-hidden bg-canvas">
      <Header />
      <main className="relative flex-1 overflow-hidden">
        <MapCanvas />
        {children}
        <QueuePanel />
      </main>
      <Toaster
        position="bottom-center"
        offset={28}
        toastOptions={{
          style: {
            background: "var(--color-ink)",
            color: "#fff",
            border: "none",
            borderRadius: 12,
            fontSize: 14,
            width: "min(640px, calc(100vw - 32px))",
          },
          actionButtonStyle: {
            background: "transparent",
            color: "#5eead4",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          },
        }}
      />
    </div>
  );
}
