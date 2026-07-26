import { expect, test } from "@playwright/test";
import path from "node:path";

import {
  fixtureCustomerId,
  fixtureProductId,
  hasOwnerCredentials,
  signInAsOwner,
} from "../fixtures/owner-auth";
import { applyTheme } from "../fixtures/theme";

const evidenceDir = path.join(
  "contexts",
  "execution",
  "app-reference-redesign",
  "evidence",
  "phase-9",
);

const adminPages = [
  {
    slug: "overview",
    path: "/admin/overview",
    heading: "Overview",
  },
  {
    slug: "price-history",
    path: `/admin/products/${fixtureProductId}/price-history`,
    heading: "Price history",
  },
  {
    slug: "ledger",
    path: `/admin/customers/${fixtureCustomerId}/ledger`,
    heading: "Customer ledger",
  },
] as const;

test.describe("admin visual sign-off", () => {
  test.skip(!hasOwnerCredentials, "requires E2E owner credentials");

  for (const adminPage of adminPages) {
    test(`captures ${adminPage.slug} light/dark responsive views`, async ({
      page,
    }, testInfo) => {
      const theme =
        (testInfo.project.metadata?.vendaraTheme as "light" | "dark" | undefined) ??
        "light";
      const viewport =
        (testInfo.project.metadata?.vendaraViewport as string | undefined) ??
        "unknown";

      await applyTheme(page, theme);
      await signInAsOwner(page);
      await page.goto(adminPage.path);
      await expect(
        page.getByRole("heading", { name: adminPage.heading, level: 1 }),
      ).toBeVisible();

      const prefix = `${adminPage.slug}-${viewport}-${theme}`;
      await page.screenshot({
        path: path.join(evidenceDir, `${prefix}-above-fold.png`),
        fullPage: false,
      });
      await page.screenshot({
        path: path.join(evidenceDir, `${prefix}-full.png`),
        fullPage: true,
      });
    });
  }
});
