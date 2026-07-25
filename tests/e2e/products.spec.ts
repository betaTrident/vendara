import { test, expect } from "@playwright/test";

const ownerEmail = process.env.E2E_OWNER_EMAIL;
const ownerPassword = process.env.E2E_OWNER_PASSWORD;

test.describe("products", () => {
  test.skip(!ownerEmail || !ownerPassword, "requires E2E owner credentials");

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin");
    await page.getByLabel(/email/i).fill(ownerEmail!);
    await page.getByLabel(/password/i).fill(ownerPassword!);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/\/admin\/overview/);
    await page
      .getByRole("navigation", { name: /primary|admin navigation/i })
      .getByRole("button", { name: "Products" })
      .first()
      .click();
  });

  test("shows the products work area at a stable URL", async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/products/);
    await expect(
      page.locator('[data-nav-id="products"][data-active="true"]').first(),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Products", level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /add product/i }),
    ).toBeVisible();
    await expect(page.getByLabel("Product metrics")).toBeVisible();
  });

  test("opens add product panel with supported fields only", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /add product/i }).click();
    await expect(page.getByLabel(/product name/i)).toBeVisible();
    await expect(page.getByLabel(/cost price/i)).toBeVisible();
    await expect(page.getByLabel(/selling price/i)).toBeVisible();
    await expect(page.getByText(/sku|barcode|category|stock quantity/i)).toHaveCount(0);
  });
});
