import { expect, test } from "@playwright/test";
import path from "node:path";

import { applyTheme } from "../fixtures/theme";

const evidenceDir = path.join(
  "contexts",
  "execution",
  "app-reference-redesign",
  "evidence",
  "phase-9",
);

test.describe("login visual sign-off", () => {
  test("captures login light/dark responsive views", async ({ page }, testInfo) => {
    const theme =
      (testInfo.project.metadata?.vendaraTheme as "light" | "dark" | undefined) ??
      "light";
    const viewport =
      (testInfo.project.metadata?.vendaraViewport as string | undefined) ??
      "unknown";

    await applyTheme(page, theme);
    await page.goto("/admin");
    await expect(page.locator("#login-email")).toBeVisible({ timeout: 20_000 });
    await expect(
      page.getByRole("heading", { name: /welcome back/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();

    const prefix = `login-${viewport}-${theme}`;
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
