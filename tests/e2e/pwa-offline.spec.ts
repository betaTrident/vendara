import { test, expect } from "@playwright/test";

test.describe("PWA offline shell", () => {
  test("offline page explains connectivity requirements", async ({ page }) => {
    await page.goto("/offline");
    await expect(page.getByRole("heading", { name: /offline/i })).toBeVisible();
    await expect(
      page.getByText(/store data right now/i),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /try again/i })).toBeVisible();
    await expect(
      page.getByRole("button", { name: /offline tips/i }),
    ).toBeVisible();
  });

  test("offline tips dialog opens with truthful guidance", async ({ page }) => {
    await page.goto("/offline");
    await page.waitForFunction(
      () => document.documentElement.dataset.offlinePageReady === "true",
    );
    await page.getByRole("button", { name: /offline tips/i }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog").getByText(/What needs internet/i)).toBeVisible();
    await expect(page.locator("body")).not.toContainText(/offline transaction/i);
  });

  test("try again reloads while still offline", async ({ page }) => {
    await page.goto("/offline");
    await page.context().setOffline(true);
    await page.getByRole("button", { name: /try again/i }).click();
    await expect(page).toHaveURL(/\/offline/);
    await expect(page.getByRole("heading", { name: /offline/i })).toBeVisible();
  });
});
