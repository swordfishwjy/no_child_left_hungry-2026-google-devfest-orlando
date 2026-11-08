import { defineConfig, devices } from "@playwright/test";

// Reuses a running `pnpm dev` (Next 16 allows one dev server per project): PORT=3000 npx playwright test
const PORT = Number(process.env.PORT ?? 3100);

export default defineConfig({
  testDir: "e2e",
  timeout: 45_000,
  fullyParallel: false,
  use: {
    baseURL: `http://localhost:${PORT}`,
    viewport: { width: 1440, height: 900 },
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 900 },
      },
    },
  ],
  webServer: {
    command: `pnpm dev --port ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
