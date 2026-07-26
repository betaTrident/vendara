import { expect, test } from "@playwright/test";
import path from "node:path";

import { applyTheme } from "../fixtures/theme";

const evidenceDir = path.join(
  "contexts",
  "execution",
  "app-reference-redesign",
  "evidence",
  "phase-7",
);

const ownerEmail = process.env.E2E_OWNER_EMAIL;
const ownerPassword = process.env.E2E_OWNER_PASSWORD;

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/admin");
  await page.getByLabel(/email/i).fill(ownerEmail!);
  await page.getByLabel(/password/i).fill(ownerPassword!);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/admin\/overview/);
}

test.describe("transactions visual evidence", () => {
  test.skip(!ownerEmail || !ownerPassword, "requires E2E owner credentials");

  test("captures purchase and payment light/dark responsive views", async ({
    page,
  }, testInfo) => {
    const theme =
      (testInfo.project.metadata?.vendaraTheme as "light" | "dark" | undefined) ??
      "light";
    const viewport =
      (testInfo.project.metadata?.vendaraViewport as string | undefined) ??
      "unknown";

    await applyTheme(page, theme);
    await signIn(page);

    for (const route of ["purchase", "payment"] as const) {
      await page.goto(`/admin/transactions/${route}`);
      await expect(
        page.getByRole("heading", {
          name:
            route === "purchase" ? "Record credit purchase" : "Record payment",
          level: 1,
        }),
      ).toBeVisible();

      const prefix = `transactions-${route}-${viewport}-${theme}`;
      await page.screenshot({
        path: path.join(evidenceDir, `${prefix}-above-fold.png`),
        fullPage: false,
      });
      await page.screenshot({
        path: path.join(evidenceDir, `${prefix}-full.png`),
        fullPage: true,
      });
    }
  });
});
