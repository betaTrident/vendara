import { test, expect } from "@playwright/test";

const ownerEmail = process.env.E2E_OWNER_EMAIL;
const ownerPassword = process.env.E2E_OWNER_PASSWORD;

test.describe("record purchase and payment", () => {
  test.skip(!ownerEmail || !ownerPassword, "requires E2E owner credentials");

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin");
    await page.getByLabel(/email/i).fill(ownerEmail!);
    await page.getByLabel(/password/i).fill(ownerPassword!);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/\/admin\/overview/);
  });

  test("opens dedicated purchase and payment routes", async ({ page }) => {
    await page.goto("/admin/transactions/purchase");
    await expect(page).toHaveURL(/\/admin\/transactions\/purchase/);
    await expect(
      page.getByRole("heading", { name: "Record credit purchase", level: 1 }),
    ).toBeVisible();
    await expect(page.locator("#post-debt-btn")).toBeDisabled();

    await page.goto("/admin/transactions/payment");
    await expect(page).toHaveURL(/\/admin\/transactions\/payment/);
    await expect(
      page.getByRole("heading", { name: "Record payment", level: 1 }),
    ).toBeVisible();
    await expect(page.locator("#post-payment-btn")).toBeDisabled();
  });

  test("deep-links purchase route with customer query", async ({ page }) => {
    await page.goto(
      "/admin/transactions/purchase?customer=22222222-2222-4222-8222-222222222222",
    );
    await expect(page).toHaveURL(/customer=22222222-2222-4222-8222-222222222222/);
    await expect(page.locator("#transaction-customer")).toHaveValue(
      "22222222-2222-4222-8222-222222222222",
    );
  });
});
