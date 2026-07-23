import { describe, expect, it, vi } from "vitest";

import { createProductService } from "@/lib/services/products";

describe("product service", () => {
  it("writes price history when a product price changes", async () => {
    const saveProductUpdateWithPriceHistory = vi.fn().mockResolvedValue({
      id: "product-1",
    });

    const service = createProductService({
      saveProductUpdateWithPriceHistory,
    });

    await service.update({
      id: "product-1",
      previous: {
        name: "Coffee",
        costPrice: 10,
        sellingPrice: 15,
        note: null,
      },
      next: {
        name: "Coffee",
        costPrice: 12,
        sellingPrice: 18,
        note: "new batch",
      },
    });

    expect(saveProductUpdateWithPriceHistory).toHaveBeenCalledWith({
      id: "product-1",
      next: {
        name: "Coffee",
        costPrice: 12,
        sellingPrice: 18,
        note: "new batch",
      },
      priceHistory: {
        productId: "product-1",
        oldCostPrice: 10,
        newCostPrice: 12,
        oldSellingPrice: 15,
        newSellingPrice: 18,
      },
    });
  });

  it("does not write price history when only note changes", async () => {
    const saveProductUpdateWithPriceHistory = vi.fn();

    const service = createProductService({
      saveProductUpdateWithPriceHistory,
    });

    await service.update({
      id: "product-1",
      previous: {
        name: "Coffee",
        costPrice: 10,
        sellingPrice: 15,
        note: null,
      },
      next: {
        name: "Coffee",
        costPrice: 10,
        sellingPrice: 15,
        note: "same prices",
      },
    });

    expect(saveProductUpdateWithPriceHistory).toHaveBeenCalledWith({
      id: "product-1",
      next: {
        name: "Coffee",
        costPrice: 10,
        sellingPrice: 15,
        note: "same prices",
      },
      priceHistory: null,
    });
  });
});
