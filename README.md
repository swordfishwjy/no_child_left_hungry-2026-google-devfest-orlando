# No Child Left Hungry — Food Support Spatial Portal

Map-first demo that ranks the 139 OCPS elementary schools by total food-insecurity
risk flags (0–7) and lets food banks drill from the Top 5 down to the SNAP retailers
around each school.

## Run locally

```bash
cp .env.example .env.local   # then paste your CARTO basemaps key
pnpm install
pnpm dev                     # http://localhost:3000
```

`predev` / `prebuild` / `pretest` run `pnpm data`, which:

1. `scripts/build-data.ts` — parses `data/*.csv` → `src/data/generated/{schools,retailers}.json`
   (ranking, tier mapping, nearby-retailer distances).
2. `scripts/copy-maplibre-worker.ts` — copies MapLibre's worker to `public/vendor/`.

Both outputs are gitignored and regenerated on every run.

| Script                | What                                               |
| --------------------- | -------------------------------------------------- |
| `pnpm test`           | Vitest — ranking, Riverside values, helpers        |
| `npx playwright test` | E2E (`PORT=3000` to reuse a running `pnpm dev`)    |
| `pnpm lint`           | ESLint (flat config; `next lint` is gone in v16)   |
| `pnpm typecheck`      | `tsc --noEmit` (run `npx next typegen` if stale)   |
| `pnpm build`          | Static build — all 139 × 2 school routes prerender |

## Environment

| Var                         | Purpose                                                                   |
| --------------------------- | ------------------------------------------------------------------------- |
| `NEXT_PUBLIC_CARTO_API_KEY` | CARTO Positron basemap (free key: carto.com/basemaps/apikey)              |
| `NEXT_PUBLIC_MAP_STYLE_URL` | Optional style override; without a key falls back to OpenFreeMap Positron |

The CARTO key is public by design (the browser requests tiles with it).

## Architecture

```
src/app/(portal)/layout.tsx          PortalShell: persistent map + header + toasts
src/app/(portal)/page.tsx            L1  Top 5 card            (popover = L2, client state)
src/app/(portal)/schools/[id]/       L3  Assessment drawer
src/app/(portal)/schools/[id]/retailers/  L4  Retailer view
src/components/map/                  MapCanvas, pins, popover, L4 layers, camera hooks
src/store/portal.ts                  zustand (reviewed log persisted to localStorage)
src/lib/                             types, flags config, tiers, geo, data accessors
```

The map lives in the layout so it survives navigation; the route decides the camera
(`useMapLevel` → `useMapCamera`). Map padding stays 0; drawer/card occlusion is
handled per move (`cameraForBounds` padding, `flyTo` offset).

## Implementation notes / gotchas

- **Next.js 16.4 defaults to Cache Components + Partial Prefetching.** Drawer pages read
  `params` inside `<Suspense>` (with `generateStaticParams` for all schools) to keep an
  instant static shell; otherwise dev logs `instant-shell-url-data`.
- **MapLibre 6 worker** resolves via `import.meta.url`, which breaks inside a Turbopack
  chunk → served from `/vendor` and set with `setWorkerUrl()` in `MapCanvas`.
- **Tailwind v4 drops unused theme vars.** Tokens are referenced via `var(--color-rank-N)`
  in inline styles, so the theme is declared with `@theme static`.
