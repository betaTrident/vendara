import { buildPriceHistoryRecord } from "@/lib/domain/pricing";

export type ProductRecord = {
  name: string;
  costPrice: number;
  sellingPrice: number;
  note: string | null;
};

export const createProductService = (dependencies: {
  save: (input: { id: string; next: ProductRecord }) => Promise<unknown> | unknown;
  savePriceHistory: (input: {
    productId: string;
    oldCostPrice: number;
    newCostPrice: number;
    oldSellingPrice: number;
    newSellingPrice: number;
  }) => Promise<void> | void;
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

    if (priceHistoryRecord) {
      await dependencies.savePriceHistory(priceHistoryRecord);
    }

    await dependencies.save({
      id: input.id,
      next: input.next,
    });
  },
});
