/**
 * MapLibre 6 resolves its worker via `new URL("./maplibre-gl-worker.mjs", import.meta.url)`,
 * which breaks once the library is bundled into a Turbopack chunk. Serve the
 * (self-contained) worker from /public and point MapLibre at it with setWorkerUrl().
 */
import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(path.join(process.cwd(), "package.json"));
const pkgDir = path.dirname(require.resolve("maplibre-gl/package.json"));
const outDir = path.join(process.cwd(), "public", "vendor");

mkdirSync(outDir, { recursive: true });
copyFileSync(
  path.join(pkgDir, "dist", "maplibre-gl-worker.mjs"),
  path.join(outDir, "maplibre-gl-worker.mjs"),
);
console.log("[vendor] maplibre-gl-worker.mjs → public/vendor");
