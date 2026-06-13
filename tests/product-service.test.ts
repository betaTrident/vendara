import { describe, expect, it, vi } from "vitest";

import { createProductService } from "@/lib/services/products";

describe("product service", () => {
  it("writes price history when a product price changes", async () => {
    const save = vi.fn();
    const savePriceHistory = vi.fn();

    const service = createProductService({
      save,
      savePriceHistory,
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

    expect(savePriceHistory).toHaveBeenCalledWith({
      productId: "product-1",
      oldCostPrice: 10,
      newCostPrice: 12,
      oldSellingPrice: 15,
      newSellingPrice: 18,
    });
    expect(save).toHaveBeenCalled();
  });

  it("does not write price history when only note changes", async () => {
    const save = vi.fn();
    const savePriceHistory = vi.fn();

    const service = createProductService({
      save,
      savePriceHistory,
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

    expect(savePriceHistory).not.toHaveBeenCalled();
    expect(save).toHaveBeenCalled();
  });
});
