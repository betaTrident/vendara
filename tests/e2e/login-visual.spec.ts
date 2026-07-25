import { test, expect } from "@playwright/test";
import { applyTheme } from "./fixtures/theme";

test.describe("login visual smoke", () => {
  for (const theme of ["light", "dark"] as const) {
    test(`login composition renders in ${theme} at desktop width`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await applyTheme(page, theme);
      await page.goto("/admin");
      await expect(page.locator("#login-email")).toBeVisible({ timeout: 20_000 });
      await expect(
        page.getByRole("heading", { name: /welcome back/i }),
      ).toBeVisible();
      await expect(page.getByLabel(/email address/i)).toBeVisible();
      await expect(page.getByLabel(/^password$/i)).toBeVisible();
      await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
      await expect(page.getByText(/remember me/i)).toHaveCount(0);
      await expect(page.getByText(/forgot password/i)).toHaveCount(0);
      await page.screenshot({
        path: `test-results/phase-3-login-${theme}-1440.png`,
        fullPage: true,
      });
    });

    test(`login stacks on mobile in ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 });
      await applyTheme(page, theme);
      await page.goto("/admin");
      await expect(page.locator("#login-email")).toBeVisible({ timeout: 20_000 });
      await expect(
        page.getByRole("heading", { name: /welcome back/i }),
      ).toBeVisible();
      await page.screenshot({
        path: `test-results/phase-3-login-${theme}-360.png`,
        fullPage: true,
      });
    });
  }
});
