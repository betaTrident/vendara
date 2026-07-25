import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, test } from "vitest";

const readSource = (path: string) =>
  readFileSync(resolve(process.cwd(), path), "utf8");

describe("product price history page contracts", () => {
  test("renders identity, metrics, range controls, chart, and text equivalent", () => {
    const source = readSource(
      "src/components/app/pages/ProductPriceHistoryPage.tsx",
    );

    expect(source).toContain("Back to Products");
    expect(source).toContain("Price history metrics");
    expect(source).toContain("History time range");
    expect(source).toContain("PriceTrendChart");
    expect(source).toContain("Load more history");
    expect(source).toContain("7d");
    expect(source).toContain("30d");
    expect(source).toContain("90d");
  });

  test("chart has an accessible text summary and no chart dependency", () => {
    const source = readSource(
      "src/components/app/products/PriceTrendChart.tsx",
    );

    expect(source).toContain("<svg");
    expect(source).toContain("aria-labelledby");
    expect(source).toContain("sr-only");
    expect(source).not.toMatch(/recharts|chart\.js|victory|d3/i);
  });

  test("does not invent unsupported history metadata", () => {
    const page = readSource(
      "src/components/app/pages/ProductPriceHistoryPage.tsx",
    );

    expect(page).not.toMatch(/Changed by|change note|Aling Nena/i);
    expect(page).not.toMatch(/\bSKU\b|\bBarcode\b|\bstock\b/i);
  });
});
