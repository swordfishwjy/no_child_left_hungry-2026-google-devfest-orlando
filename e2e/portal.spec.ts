import { expect, test, type Page } from "@playwright/test";

const RIVERSIDE = "48-1251";

async function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  return errors;
}

async function waitForMap(page: Page) {
  await expect(page.locator(".maplibregl-canvas")).toBeVisible();
  await expect(page.getByRole("button", { name: /Focus #1:/ })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  // Start every test with an empty review log.
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
});

test("drill down: overview → popover → assessment → retailers → back", async ({
  page,
}) => {
  const errors = await collectErrors(page);
  await page.goto("/");
  await waitForMap(page);

  const list = page.getByRole("region", { name: "Top 5 Focus Schools" });
  await expect(list.getByRole("listitem")).toHaveText([
    /Riverside Elementary.*6\/7/,
    /Phillis Wheatley Elementary.*6\/7/,
    /Lovell Elementary.*5\/7/,
    /Eagles Nest Elementary.*5\/7/,
    /Lake Gem Elementary.*5\/7/,
  ]);

  await page.getByRole("button", { name: /Focus #1:/ }).click();
  const popover = page.getByRole("dialog", { name: /Riverside Elementary/ });
  await expect(popover).toBeVisible();
  // Popover must not be clipped by the header (64px) after auto-pan.
  await expect
    .poll(async () => (await popover.boundingBox())?.y ?? 0)
    .toBeGreaterThanOrEqual(64);

  await popover.getByRole("link", { name: "Investigate Details" }).click();
  await expect(page).toHaveURL(`/schools/${RIVERSIDE}`);
  const drawer = page.getByRole("complementary", { name: /assessment/ });
  await expect(drawer.getByRole("heading", { level: 1 })).toHaveText(
    "Riverside Elementary",
  );
  await expect(drawer.getByText("6 of 7", { exact: true })).toBeVisible();
  await expect(drawer.getByRole("listitem")).toHaveCount(7);

  await drawer
    .getByRole("link", { name: /Explore local food retailers/ })
    .click();
  await expect(page).toHaveURL(`/schools/${RIVERSIDE}/retailers`);
  const drawer4 = page.getByRole("complementary", { name: /local food/ });
  await expect(drawer4.getByText("Nearest grocery store")).toBeVisible();
  await expect(
    drawer4.getByText("1.49 mi", { exact: true }).first(),
  ).toBeVisible();
  await expect(page.getByRole("region", { name: "Insight" })).toContainText(
    "49% beyond the 1-mile threshold.",
  );
  await expect(drawer4.getByText(/Sacks Grocery Outlets Inc\. \(/)).toHaveCount(
    0,
  );

  await page.getByRole("link", { name: "Back to School Assessment" }).click();
  await expect(page).toHaveURL(`/schools/${RIVERSIDE}`);
  await page.goBack();
  await expect(page).toHaveURL(`/schools/${RIVERSIDE}/retailers`);

  expect(errors).toEqual([]);
});

test("mark as reviewed loads #6, undo restores, log persists", async ({
  page,
}) => {
  const errors = await collectErrors(page);
  await page.goto("/");
  await waitForMap(page);

  await page.getByRole("button", { name: /Focus #3:/ }).click();
  await page.getByRole("button", { name: "Mark as Reviewed" }).click();

  await expect(
    page.getByText(
      "Lovell Elementary (#3) marked as reviewed. Focus #6 (Rolling Hills Elementary) loaded to map.",
    ),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Focus #6:/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Focus #3:/ })).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Reviewed (1)" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Undo" }).click();
  await expect(page.getByRole("button", { name: /Focus #3:/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Focus #6:/ })).toHaveCount(0);

  // Review again, then reload — the log is persisted in localStorage.
  await page.getByRole("button", { name: /Focus #3:/ }).click();
  await page.getByRole("button", { name: "Mark as Reviewed" }).click();
  await expect(
    page.getByRole("button", { name: "Reviewed (1)" }),
  ).toBeVisible();
  await page.reload();
  await waitForMap(page);
  await expect(
    page.getByRole("button", { name: "Reviewed (1)" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Focus #6:/ })).toBeVisible();

  expect(errors).toEqual([]);
});

test("reviewed panel restores a school", async ({ page }) => {
  await page.goto("/");
  await waitForMap(page);
  await page.getByRole("button", { name: /Focus #2:/ }).click();
  await page.getByRole("button", { name: "Mark as Reviewed" }).click();
  await expect(
    page.getByRole("button", { name: "Reviewed (1)" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Reviewed (1)" }).click();
  const panel = page.getByRole("complementary", { name: "Reviewed Schools" });
  await expect(panel.getByText("Phillis Wheatley Elementary")).toBeVisible();
  await panel.getByRole("button", { name: "Restore" }).click();
  await expect(panel.getByText("No schools reviewed yet.")).toBeVisible();
  await expect(page.getByRole("button", { name: /Focus #2:/ })).toBeVisible();
});

test("deep link to a retailer view renders directly", async ({ page }) => {
  const errors = await collectErrors(page);
  await page.goto(`/schools/${RIVERSIDE}/retailers`);
  await expect(page.locator(".maplibregl-canvas")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Local Food Retailers" }),
  ).toBeVisible();
  await expect(page.getByText("24 within 2 mi")).toBeVisible();

  await page.getByRole("button", { name: /Limited/ }).click();
  await expect(page.getByText("4 shown")).toBeVisible();
  expect(errors).toEqual([]);
});

test("add to My Focus hides the pin, loads the next school, and lists it", async ({
  page,
}) => {
  const errors = await collectErrors(page);
  await page.goto("/");
  await waitForMap(page);

  await page.getByRole("button", { name: /Focus #1:/ }).click();
  await page.getByRole("button", { name: "Add to My Focus" }).click();

  await expect(
    page.getByText(
      "Riverside Elementary (#1) added to My Focus. Focus #6 (Rolling Hills Elementary) loaded to map.",
    ),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Focus #1:/ })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Focus #6:/ })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "My Focus (1)" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Reviewed (0)" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "My Focus (1)" }).click();
  const panel = page.getByRole("complementary", { name: "My Focus List" });
  await expect(panel.getByText("Riverside Elementary")).toBeVisible();

  // Opening it from the list shows its status in the drawer.
  await panel.getByRole("link", { name: "Open Riverside Elementary" }).click();
  await expect(page).toHaveURL(`/schools/${RIVERSIDE}`);
  await expect(page.getByText("In My Focus", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Return to map" }).click();
  await expect(
    page.getByRole("button", { name: "Add to My Focus" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "My Focus (0)" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("drawer shows a single Need Flags list and tier tooltips explain store types", async ({
  page,
}) => {
  await page.goto(`/schools/${RIVERSIDE}`);
  await expect(page.getByRole("heading", { name: "Need Flags" })).toBeVisible();
  await expect(page.getByText("Primary Need Flags")).toHaveCount(0);
  await expect(page.getByText(/Sacks Grocery Outlets/)).toHaveCount(0);

  await page.goto(`/schools/${RIVERSIDE}/retailers`);
  await page.getByRole("button", { name: /Full grocery/ }).hover();
  const tip = page
    .getByRole("tooltip")
    .filter({ hasText: "USDA store types" })
    .first();
  await expect(tip).toBeVisible();
  await expect(tip).toContainText("Super Store");
  await expect(tip).toContainText("Supermarket");
  await expect(tip).toContainText("Grocery Store");
  await expect(page.getByText(/count as full grocery/)).toHaveCount(0);
});
