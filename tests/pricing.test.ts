import { describe, expect, it } from "vitest";

import {
  buildPriceHistoryRecord,
  hasPriceChange,
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
});
