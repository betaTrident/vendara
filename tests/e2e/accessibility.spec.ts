import { test, expect } from "@playwright/test";

test.describe("accessibility", () => {
  test("admin and offline pages expose main landmarks", async ({ page }) => {
    await page.goto("/offline");
    await expect(page.locator("#main-content")).toBeVisible();

    await page.goto("/admin");
    await expect(page.locator("#main-content")).toBeVisible();
    await expect(page.getByRole("link", { name: /skip to content/i })).toBeAttached();

    await page.goto("/admin/overview");
    await expect(page.locator("#main-content")).toBeVisible();
  });
});
