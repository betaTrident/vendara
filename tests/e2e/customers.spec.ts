import { test, expect } from "@playwright/test";

const ownerEmail = process.env.E2E_OWNER_EMAIL;
const ownerPassword = process.env.E2E_OWNER_PASSWORD;

test.describe("customers", () => {
  test.skip(!ownerEmail || !ownerPassword, "requires E2E owner credentials");

  test.beforeEach(async ({ page }) => {
    await page.goto("/admin");
    await page.getByLabel(/email/i).fill(ownerEmail!);
    await page.getByLabel(/password/i).fill(ownerPassword!);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/\/admin\/overview/);
    await page
      .getByRole("navigation", { name: /primary|admin navigation/i })
      .getByRole("button", { name: "Customers" })
      .first()
      .click();
  });

  test("shows the customers directory at a stable URL", async ({ page }) => {
    await expect(page).toHaveURL(/\/admin\/customers/);
    await expect(
      page.locator('[data-nav-id="customers"][data-active="true"]').first(),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Customers", level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /add customer/i }),
    ).toBeVisible();
    await expect(page.getByLabel("Customer metrics")).toBeVisible();
  });

  test("opens add customer panel with supported fields only", async ({
    page,
  }) => {
    await page.getByRole("button", { name: /add customer/i }).click();
    await expect(page.getByLabel(/customer name/i)).toBeVisible();
    await expect(page.getByLabel(/note/i)).toBeVisible();
    await expect(page.getByText(/phone|address|barangay/i)).toHaveCount(0);
  });
});
