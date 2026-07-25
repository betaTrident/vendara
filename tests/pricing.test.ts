import { describe, expect, it } from "vitest";

import {
  buildPriceHistoryRecord,
  buildPriceTrendSeries,
  computeMarkupAmount,
  computeMarkupPercent,
  filterPriceHistoryByRange,
  filterProducts,
  hasPriceChange,
  isLowMarkup,
  paginateItems,
  parseHistoryPagination,
  parsePriceHistoryRange,
  summarizePriceHistory,
  summarizeProductCatalog,
} from "@/lib/domain/pricing";

describe("pricing domain", () => {
  it("detects when a product price has changed", () => {
    expect(
      hasPriceChange(
        { costPrice: 10, sellingPrice: 15 },
        { costPrice: 10, sellingPrice: 20 },
      ),
    ).toBe(true);
  });

  it("does not create a price history record when prices stay the same", () => {
    expect(
      buildPriceHistoryRecord("product-1", {
        previous: {
          costPrice: 10,
          sellingPrice: 15,
        },
        next: {
          costPrice: 10,
          sellingPrice: 15,
        },
      }),
    ).toBeNull();
  });

  it("creates a price history record when either price changes", () => {
    expect(
      buildPriceHistoryRecord("product-1", {
        previous: {
          costPrice: 12,
          sellingPrice: 18,
        },
        next: {
          costPrice: 14,
          sellingPrice: 20,
        },
      }),
    ).toMatchObject({
      productId: "product-1",
      oldCostPrice: 12,
      newCostPrice: 14,
      oldSellingPrice: 18,
      newSellingPrice: 20,
    });
  });

  it("computes markup amount and percent for normal prices", () => {
    expect(computeMarkupAmount(10, 13)).toBe(3);
    expect(computeMarkupPercent(10, 13)).toBeCloseTo(30);
  });

  it("returns null markup percent for zero or negative cost", () => {
    expect(computeMarkupPercent(0, 12)).toBeNull();
    expect(computeMarkupPercent(-1, 12)).toBeNull();
  });

  it("flags low markup under the 10% threshold", () => {
    expect(isLowMarkup(9.9)).toBe(true);
    expect(isLowMarkup(10)).toBe(false);
    expect(isLowMarkup(null)).toBe(false);
  });

  it("summarizes catalog metrics including recent updates and low markup", () => {
    const now = new Date("2026-07-25T12:00:00.000Z");
    const summary = summarizeProductCatalog(
      [
        {
          id: "a",
          name: "High",
          costPrice: 10,
          sellingPrice: 20,
          updatedAt: "2026-07-24T12:00:00.000Z",
        },
        {
          id: "b",
          name: "Low",
          costPrice: 10,
          sellingPrice: 10.5,
          updatedAt: "2026-07-01T12:00:00.000Z",
        },
        {
          id: "c",
          name: "Zero cost",
          costPrice: 0,
          sellingPrice: 5,
          updatedAt: "2026-07-20T12:00:00.000Z",
        },
      ],
      now,
    );

    expect(summary.total).toBe(3);
    expect(summary.recentlyUpdated).toBe(2);
    expect(summary.highestMarkup).toMatchObject({
      productId: "a",
      name: "High",
      percent: 100,
    });
    expect(summary.lowMarkupCount).toBe(1);
  });

  it("filters products by search and low-markup-only", () => {
    const products = [
      {
        id: "1",
        name: "Lucky Me",
        costPrice: 10,
        sellingPrice: 20,
        updatedAt: "2026-07-01T00:00:00.000Z",
      },
      {
        id: "2",
        name: "Bear Brand",
        costPrice: 50,
        sellingPrice: 52,
        updatedAt: "2026-07-01T00:00:00.000Z",
      },
    ];

    expect(filterProducts(products, { search: "lucky" })).toHaveLength(1);
    expect(filterProducts(products, { lowMarkupOnly: true })).toEqual([
      products[1],
    ]);
  });

  it("paginates items and clamps out-of-range pages", () => {
    const items = [1, 2, 3, 4, 5];
    expect(paginateItems(items, 2, 2)).toMatchObject({
      items: [3, 4],
      page: 2,
      total: 5,
      totalPages: 3,
    });
    expect(paginateItems(items, 99, 2).page).toBe(3);
  });

  it("filters price history by range windows", () => {
    const now = new Date("2026-07-25T00:00:00.000Z");
    const items = [
      { id: "1", changedAt: "2026-07-20T00:00:00.000Z" },
      { id: "2", changedAt: "2026-06-01T00:00:00.000Z" },
      { id: "3", changedAt: "2026-01-01T00:00:00.000Z" },
    ];

    expect(filterPriceHistoryByRange(items, "7d", now)).toHaveLength(1);
    expect(filterPriceHistoryByRange(items, "30d", now)).toHaveLength(1);
    expect(filterPriceHistoryByRange(items, "90d", now)).toHaveLength(2);
    expect(filterPriceHistoryByRange(items, "all", now)).toHaveLength(3);
  });

  it("summarizes empty and populated price history", () => {
    expect(summarizePriceHistory([])).toEqual({
      totalChanges: 0,
      latestUpdate: null,
      averageMarkup: null,
    });

    const summary = summarizePriceHistory([
      {
        id: "1",
        changedAt: "2026-07-20T00:00:00.000Z",
        oldCostPrice: 10,
        newCostPrice: 10,
        oldSellingPrice: 15,
        newSellingPrice: 20,
      },
      {
        id: "2",
        changedAt: "2026-07-22T00:00:00.000Z",
        oldCostPrice: 10,
        newCostPrice: 8,
        oldSellingPrice: 20,
        newSellingPrice: 16,
      },
    ]);

    expect(summary.totalChanges).toBe(2);
    expect(summary.latestUpdate).toBe("2026-07-22T00:00:00.000Z");
    expect(summary.averageMarkup).toBeCloseTo(100);
  });

  it("builds an ascending trend series including prior point", () => {
    const series = buildPriceTrendSeries([
      {
        id: "2",
        changedAt: "2026-07-22T00:00:00.000Z",
        oldCostPrice: 10,
        newCostPrice: 8,
        oldSellingPrice: 20,
        newSellingPrice: 16,
      },
      {
        id: "1",
        changedAt: "2026-07-20T00:00:00.000Z",
        oldCostPrice: 9,
        newCostPrice: 10,
        oldSellingPrice: 15,
        newSellingPrice: 20,
      },
    ]);

    expect(series[0]).toMatchObject({
      costPrice: 9,
      sellingPrice: 15,
    });
    expect(series.at(-1)).toMatchObject({
      costPrice: 8,
      sellingPrice: 16,
    });
  });

  it("parses history range and pagination query values", () => {
    expect(parsePriceHistoryRange(undefined)).toBe("all");
    expect(parsePriceHistoryRange("30d")).toBe("30d");
    expect(parsePriceHistoryRange("nope")).toBeNull();

    expect(parseHistoryPagination({ limit: "25", offset: "0" })).toEqual({
      ok: true,
      limit: 25,
      offset: 0,
    });
    expect(parseHistoryPagination({ limit: "999", offset: "0" }).ok).toBe(false);
    expect(parseHistoryPagination({ limit: "10", offset: "-1" }).ok).toBe(false);
  });

  it("handles large money values without inventing inventory scope", () => {
    expect(computeMarkupPercent(1_000_000, 1_250_000)).toBeCloseTo(25);
    expect(computeMarkupAmount(1_000_000, 1_250_000)).toBe(250_000);
  });
});
