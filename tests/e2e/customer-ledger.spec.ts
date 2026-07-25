import { test, expect } from "@playwright/test";

const ownerEmail = process.env.E2E_OWNER_EMAIL;
const ownerPassword = process.env.E2E_OWNER_PASSWORD;

test.describe("customer ledger", () => {
  test.skip(!ownerEmail || !ownerPassword, "requires E2E owner credentials");

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin");
    await page.getByLabel(/email/i).fill(ownerEmail!);
    await page.getByLabel(/password/i).fill(ownerPassword!);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/\/admin\/overview/);
  });

  test("can open the customers work area from overview", async ({ page }) => {
    await page.getByRole("button", { name: "Manage customers" }).click();
    await expect(page).toHaveURL(/\/admin\/customers/);
    await expect(
      page.locator('[data-nav-id="customers"][data-active="true"]').first(),
    ).toBeVisible();
  });
});
