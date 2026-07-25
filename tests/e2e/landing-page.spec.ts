import { expect, test } from "@playwright/test";

import { applyTheme, expectDocumentTheme } from "./fixtures/theme";

test.describe("public landing page", () => {
  test("isolates the public render path from private APIs", async ({ page }) => {
    const privateApiHits: string[] = [];
    page.on("request", (request) => {
      const url = request.url();
      if (/\/api\/(products|customers|ledger|transactions|summary)/i.test(url)) {
        privateApiHits.push(url);
      }
    });

    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /Private store administration/i,
    );
    expect(privateApiHits).toEqual([]);
  });

  test("exposes accurate metadata and landmarks", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Vendara/i);
    const description = page.locator('meta[name="description"]');
    await expect(description).toHaveAttribute("content", /private workspace/i);

    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute("href", /\/$/);

    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.locator("#main-content")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("wires working CTAs and keeps sign-in on /admin", async ({ page }) => {
    await page.goto("/");

    const adminLinks = page.getByRole("link", { name: /Admin sign in|Open admin sign in/i });
    await expect(adminLinks.first()).toHaveAttribute("href", "/admin");

    await page.getByRole("link", { name: /View screens|Explore the workspace/i }).first().click();
    await expect(page.locator("#product")).toBeInViewport();

    await page.getByRole("button", { name: "Request access" }).first().click();
    const dialog = page.getByRole("dialog", { name: "Request Vendara access" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("link", { name: "Open admin sign in" })).toHaveAttribute(
      "href",
      "/admin",
    );
  });

  test("lets a visitor explore product screens and read truthful offline answers", async ({
    page,
  }) => {
    await page.goto("/");

    await page.getByRole("tab", { name: "Customers" }).click();
    await expect(page.getByRole("tab", { name: "Customers" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await expect(page.getByAltText("Vendara customers workspace")).toBeVisible();

    const faq = page.getByRole("button", { name: /Does Vendara work offline/i });
    await faq.click();
    await expect(faq).toHaveAttribute("aria-expanded", "true");
    await expect(
      page.getByText(/need an internet connection so the store record remains accurate/i),
    ).toBeVisible();
    await expect(page.locator("body")).not.toContainText(/sync(?:ing|s)? automatically/i);
    await expect(page.locator("body")).not.toContainText(/offline transaction/i);
  });

  test("applies light and dark theme without private data", async ({ page }) => {
    await applyTheme(page, "dark");
    await page.goto("/");
    expect(await expectDocumentTheme(page, "dark")).toBe(true);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    await applyTheme(page, "light");
    await page.goto("/");
    expect(await expectDocumentTheme(page, "light")).toBe(true);
  });

  test("uses optimized public brand wordmarks instead of archive logo sources", async ({
    page,
  }) => {
    await page.goto("/");
    const brand = page.locator(".site-header .brand img").first();
    await expect(brand).toHaveAttribute("src", /\/brand\/vendara-wordmark-/);
  });
});
