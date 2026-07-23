import { buildPriceHistoryRecord } from "@/lib/domain/pricing";

export type ProductRecord = {
  name: string;
  costPrice: number;
  sellingPrice: number;
  note: string | null;
};

export const createProductService = (dependencies: {
  saveProductUpdateWithPriceHistory: (input: {
    id: string;
    next: ProductRecord;
    priceHistory: {
      productId: string;
      oldCostPrice: number;
      newCostPrice: number;
      oldSellingPrice: number;
      newSellingPrice: number;
    } | null;
  }) => Promise<unknown> | unknown;
}) => ({
  async update(input: {
    id: string;
    previous: ProductRecord;
    next: ProductRecord;
  }) {
    const priceHistoryRecord = buildPriceHistoryRecord(input.id, {
      previous: {
        costPrice: input.previous.costPrice,
        sellingPrice: input.previous.sellingPrice,
      },
      next: {
        costPrice: input.next.costPrice,
        sellingPrice: input.next.sellingPrice,
      },
    });

    return dependencies.saveProductUpdateWithPriceHistory({
      id: input.id,
      next: input.next,
      priceHistory: priceHistoryRecord,
    });
  },
});
