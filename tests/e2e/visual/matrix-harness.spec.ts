import { expect, test } from "@playwright/test";

import { applyTheme } from "../fixtures/theme";

/**
 * Phase 0 harness smoke: proves viewport/theme projects boot and can force theme.
 * Does not claim visual parity with references.
 */
test.describe("visual matrix harness", () => {
  test("offline landmark renders at project viewport with forced theme", async ({
    page,
}, testInfo) => {
    const theme =
      (testInfo.project.metadata?.vendaraTheme as "light" | "dark" | undefined) ??
      "light";

    await applyTheme(page, theme);
    await page.goto("/offline");

    await expect(page.locator("#main-content")).toBeVisible();

    const viewport = page.viewportSize();
    expect(viewport).not.toBeNull();
    expect(viewport!.width).toBeGreaterThanOrEqual(360);
  });
});
