import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, test } from "vitest";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("products page contracts", () => {
  test("ProductsPage is URL-backed with metrics, search, and no inventory scope", () => {
    const page = read("src/components/app/pages/ProductsPage.tsx");
    const metrics = read("src/components/app/products/ProductMetrics.tsx");
    const dialog = read("src/components/app/products/DeleteProductDialog.tsx");

    expect(page).toContain('title="Products"');
    expect(page).toContain("PageHeader");
    expect(page).toContain("product-price-history");
    expect(page).toContain("DeleteProductDialog");
    expect(page).toContain("ProductMetrics");
    expect(metrics).toContain("Total Products");
    expect(metrics).toContain("Recently Updated");
    expect(metrics).toContain("Highest Markup");
    expect(metrics).toContain("Low Markup");
    expect(dialog).toContain("AlertDialog");
    expect(page).not.toMatch(/\bstock\b|\binventory quantity\b/i);
    expect(page).not.toMatch(/\bSKU\b|\bBarcode\b|\bCategory\b/);
  });

  test("product form panel only exposes supported fields", () => {
    const source = read("src/components/app/products/ProductFormPanel.tsx");

    expect(source).toContain("product-name");
    expect(source).toContain("cost-price");
    expect(source).toContain("selling-price");
    expect(source).toContain("product-note");
    expect(source).toContain("computeMarkupPercent");
    expect(source).not.toMatch(/\bSKU\b|\bBarcode\b|\bCategory\b/);
    expect(source).not.toMatch(/quantity|stock/i);
  });

  test("AdminConsole wires Products and dedicated price-history pages", () => {
    const source = read("src/components/app/AdminConsole.tsx");

    expect(source).toContain("ProductsPage");
    expect(source).toContain("ProductPriceHistoryPage");
    expect(source).not.toContain("ProductManager");
    expect(source).toContain('case "product-price-history"');
    expect(source).toMatch(
      /case "product-price-history":\s*return \(\s*<ProductPriceHistoryPage/,
    );
  });
});

describe("product price history page contracts", () => {
  test("history page provides chart text equivalent and omits deferred actor/notes", () => {
    const page = read("src/components/app/pages/ProductPriceHistoryPage.tsx");
    const chart = read("src/components/app/products/PriceTrendChart.tsx");

    expect(page).toContain("Back to Products");
    expect(page).toContain("Total changes");
    expect(page).toContain("Average markup");
    expect(page).toContain("7d");
    expect(page).toContain("30d");
    expect(page).toContain("PriceTrendChart");
    expect(chart).toContain("sr-only");
    expect(chart).toContain("price-trend-chart-summary");
    expect(page).not.toMatch(/Aling Nena|Changed by|change note/i);
    expect(page).not.toMatch(/\bSKU\b|\bBarcode\b/);
  });

  test("history API validates range and pagination without schema migration fields", () => {
    const api = read("src/pages/api/products/[id]/history.ts");
    const repo = read("src/lib/server/products-repository.ts");

    expect(api).toContain("parsePriceHistoryRange");
    expect(api).toContain("parseHistoryPagination");
    expect(api).toContain("requireOwner");
    expect(api).toContain("parseRouteUuid");
    expect(repo).toContain("listPriceHistory");
    expect(repo).not.toMatch(/changed_by|change_note|sku|barcode|category|stock/i);
  });
});
