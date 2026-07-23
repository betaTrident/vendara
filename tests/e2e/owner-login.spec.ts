import { test, expect } from "@playwright/test";

const ownerEmail = process.env.E2E_OWNER_EMAIL;
const ownerPassword = process.env.E2E_OWNER_PASSWORD;

test.describe("owner login", () => {
  test.skip(!ownerEmail || !ownerPassword, "requires E2E_OWNER_EMAIL and E2E_OWNER_PASSWORD");

  test("owner can reach the admin workspace", async ({ page }) => {
    await page.goto("/admin");
    await page.getByLabel(/email/i).fill(ownerEmail!);
    await page.getByLabel(/password/i).fill(ownerPassword!);
    await page.getByRole("button", { name: /sign in/i }).click();
    await expect(page.getByRole("heading", { name: "Vendara" })).toBeVisible();
    await expect(page.getByText("Owner")).toBeVisible();
  });
});
