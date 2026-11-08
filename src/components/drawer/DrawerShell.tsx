import type { ReactNode } from "react";

/** 420px right-side panel that slides over the map (Levels 3–4). */
export function DrawerShell({
  label,
  header,
  footer,
  children,
}: {
  label: string;
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <aside
      aria-label={label}
      className="absolute top-0 right-0 bottom-0 z-20 flex w-[420px] animate-drawer-in flex-col border-l border-line bg-surface shadow-pop"
    >
      <div className="border-b border-line px-6 pt-5 pb-4">{header}</div>
      <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
        {children}
      </div>
      <div className="border-t border-line bg-surface px-6 py-4">{footer}</div>
    </aside>
  );
}
