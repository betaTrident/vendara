import { expect, test } from "@playwright/test";
import path from "node:path";

import { applyTheme } from "../fixtures/theme";

const evidenceDir = path.join(
  "contexts",
  "execution",
  "app-reference-redesign",
  "evidence",
  "phase-8",
);

test.describe("offline visual evidence", () => {
  test("captures offline light/dark responsive views", async ({ page }, testInfo) => {
    const theme =
      (testInfo.project.metadata?.vendaraTheme as "light" | "dark" | undefined) ??
      "light";
    const viewport =
      (testInfo.project.metadata?.vendaraViewport as string | undefined) ??
      "unknown";

    await applyTheme(page, theme);
    await page.goto("/offline");

    await expect(page.locator("#main-content")).toBeVisible();
    await expect(page.getByRole("heading", { name: /offline/i })).toBeVisible();

    const prefix = `offline-${viewport}-${theme}`;
    await page.screenshot({
      path: path.join(evidenceDir, `${prefix}-above-fold.png`),
      fullPage: false,
    });
    await page.screenshot({
      path: path.join(evidenceDir, `${prefix}-full.png`),
      fullPage: true,
    });
  });
});
