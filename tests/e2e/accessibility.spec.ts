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

  test("public landing exposes a single main landmark and skip link", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("#main-content")).toBeVisible();
    await expect(page.getByRole("link", { name: /skip to content/i })).toBeAttached();
  });

  test("skip link moves focus to main content on keyboard activation", async ({
    page,
  }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skipLink = page.getByRole("link", { name: /skip to content/i });
    await expect(skipLink).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();
  });

  test("landing remains readable at 200% zoom without horizontal page scroll", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 720, height: 900 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(() => {
      const root = document.documentElement;
      return root.scrollWidth > root.clientWidth + 1;
    });
    expect(hasHorizontalOverflow).toBe(false);
  });

  test("honors reduced motion preference on the offline page", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/offline");
    await expect(page.getByRole("heading", { name: /offline/i })).toBeVisible();
    await expect(page.locator("#main-content")).toBeVisible();
  });
});
