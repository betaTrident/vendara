import { expect, test } from "@playwright/test";
import path from "node:path";

import { applyTheme } from "../fixtures/theme";

const evidenceDir = path.join(
  "contexts",
  "execution",
  "app-reference-redesign",
  "evidence",
  "phase-5",
);

const ownerEmail = process.env.E2E_OWNER_EMAIL;
const ownerPassword = process.env.E2E_OWNER_PASSWORD;

async function signInToProducts(page: import("@playwright/test").Page) {
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
  await expect(page).toHaveURL(/\/admin\/products/);
  await expect(
    page.getByRole("heading", { name: "Products", level: 1 }),
  ).toBeVisible();
}

test.describe("products visual evidence", () => {
  test.skip(!ownerEmail || !ownerPassword, "requires E2E owner credentials");

  test("captures products light/dark responsive views", async ({
    page,
  }, testInfo) => {
    const theme =
      (testInfo.project.metadata?.vendaraTheme as "light" | "dark" | undefined) ??
      "light";
    const viewport =
      (testInfo.project.metadata?.vendaraViewport as string | undefined) ??
      "unknown";

    await applyTheme(page, theme);
    await signInToProducts(page);

    const prefix = `products-${viewport}-${theme}`;
    await page.screenshot({
      path: path.join(evidenceDir, `${prefix}-above-fold.png`),
      fullPage: false,
    });
    await page.screenshot({
      path: path.join(evidenceDir, `${prefix}-full.png`),
      fullPage: true,
    });
  });
});
