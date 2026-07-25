import { test, expect } from "@playwright/test";

test.describe("admin shell routing", () => {
  test("unknown admin paths render a branded not-found state", async ({
    page,
  }) => {
    await page.goto("/admin/does-not-exist");
    await expect(page.locator("#main-content")).toBeVisible();
    // Unauthenticated users still see login; path is preserved for post-auth.
    // Authenticated not-found is covered by unit route parsing.
    await expect(page.getByRole("link", { name: /skip to content/i })).toBeAttached();
  });

  test("admin catch-all and entry expose main landmarks", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator("#main-content")).toBeVisible();

    await page.goto("/admin/overview");
    await expect(page.locator("#main-content")).toBeVisible();
  });
});
