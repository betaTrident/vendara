import type { Page } from "@playwright/test";

export const ownerEmail = process.env.E2E_OWNER_EMAIL;
export const ownerPassword = process.env.E2E_OWNER_PASSWORD;

export const hasOwnerCredentials = Boolean(ownerEmail && ownerPassword);

export const fixtureProductId = "11111111-1111-4111-8111-111111111111";
export const fixtureCustomerId = "22222222-2222-4222-8222-222222222222";

export async function signInAsOwner(page: Page): Promise<void> {
  await page.goto("/admin");
  await page.getByLabel(/email/i).fill(ownerEmail!);
  await page.getByLabel(/password/i).fill(ownerPassword!);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/admin\/overview/);
}
