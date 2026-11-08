/**
 * Captures one screenshot per UI level of the running app into ../docs/screenshots.
 *   L1 overview · L2 pin popover · L3 school assessment · L4 local food retailers
 *
 * Usage: node scripts/capture-screenshots.cjs [baseUrl]   (default http://localhost:3000)
 */
const path = require("node:path");
const fs = require("node:fs");
const { chromium } = require("@playwright/test");

const BASE = process.argv[2] || "http://localhost:3000";
const OUT = path.join(__dirname, "..", "..", "docs", "screenshots");
const SCHOOL = "48-1251"; // Riverside Elementary, Focus #1

async function shoot(page, file, settleMs) {
  await page.waitForTimeout(settleMs);
  await page.mouse.move(0, 0);
  await page.evaluate(() => {
    document.querySelectorAll("nextjs-portal").forEach((n) => n.remove());
    document.querySelectorAll("[data-sonner-toaster]").forEach((n) => (n.style.display = "none"));
  });
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(OUT, file) });
  console.log("✓", file);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });

  await page.goto(`${BASE}/`);
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle" });
  await shoot(page, "01-overview.png", 2600);

  await page.getByRole("button", { name: /Focus #1:/ }).click();
  await shoot(page, "02-pin-popover.png", 1300);

  await page.goto(`${BASE}/schools/${SCHOOL}`, { waitUntil: "networkidle" });
  await shoot(page, "03-school-assessment.png", 2600);

  await page.goto(`${BASE}/schools/${SCHOOL}/retailers`, { waitUntil: "networkidle" });
  await shoot(page, "04-local-food-retailers.png", 3000);

  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
