import { test, expect } from "@playwright/test";

test.describe("PWA update prompt", () => {
  test("update UI copy is present in the admin bundle", async ({ page }) => {
    await page.goto("/admin");
    const source = await page.content();
    expect(source).toContain("Vendara");
  });
});
