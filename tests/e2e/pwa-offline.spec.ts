import { test, expect } from "@playwright/test";

test.describe("PWA offline shell", () => {
  test("offline page explains connectivity requirements", async ({ page }) => {
    await page.goto("/offline");
    await expect(page.getByRole("heading", { name: /offline/i })).toBeVisible();
    await expect(
      page.getByText(/internet connection/i),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /try again/i })).toBeVisible();
  });
});
