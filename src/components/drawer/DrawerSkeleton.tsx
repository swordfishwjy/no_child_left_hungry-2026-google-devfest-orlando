/** Placeholder while a drawer route resolves its params. */
export function DrawerSkeleton() {
  return (
    <aside
      aria-busy
      aria-label="Loading"
      className="absolute top-0 right-0 bottom-0 z-20 flex w-[420px] flex-col gap-4 border-l border-line bg-surface p-6 shadow-pop"
    >
      <div className="h-4 w-24 animate-pulse rounded bg-line" />
      <div className="h-7 w-56 animate-pulse rounded bg-line" />
      <div className="h-24 animate-pulse rounded-xl bg-canvas" />
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-lg bg-canvas" />
      ))}
    </aside>
  );
}
