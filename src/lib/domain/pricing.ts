export type ProductPriceSnapshot = {
  costPrice: number;
  sellingPrice: number;
};

export type PriceHistoryRecord = {
  productId: string;
  oldCostPrice: number;
  newCostPrice: number;
  oldSellingPrice: number;
  newSellingPrice: number;
};

export const hasPriceChange = (
  previous: ProductPriceSnapshot,
  next: ProductPriceSnapshot,
) =>
  previous.costPrice !== next.costPrice ||
  previous.sellingPrice !== next.sellingPrice;

export const buildPriceHistoryRecord = (
  productId: string,
  prices: {
    previous: ProductPriceSnapshot;
    next: ProductPriceSnapshot;
  },
): PriceHistoryRecord | null => {
  if (!hasPriceChange(prices.previous, prices.next)) {
    return null;
  }

  return {
    productId,
    oldCostPrice: prices.previous.costPrice,
    newCostPrice: prices.next.costPrice,
    oldSellingPrice: prices.previous.sellingPrice,
    newSellingPrice: prices.next.sellingPrice,
  };
};
