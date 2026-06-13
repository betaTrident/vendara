export type LedgerProductSnapshot = {
  id: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
};

export type DebtEntryProductInput = {
  product: LedgerProductSnapshot;
  quantity: number;
};

export type DebtEntrySnapshotItem = {
  productId: string;
  productNameSnapshot: string;
  unitCostPriceSnapshot: number;
  unitSellingPriceSnapshot: number;
  quantity: number;
  lineTotal: number;
};

export type LedgerBalanceEntry =
  | {
      entryType: "debt";
      totalAmount: number;
    }
  | {
      entryType: "payment";
      paymentAmount: number;
    };

export const buildDebtEntrySnapshot = (
  entries: DebtEntryProductInput[],
): {
  items: DebtEntrySnapshotItem[];
  totalAmount: number;
} => {
  const items = entries.map(({ product, quantity }) => ({
    productId: product.id,
    productNameSnapshot: product.name,
    unitCostPriceSnapshot: product.costPrice,
    unitSellingPriceSnapshot: product.sellingPrice,
    quantity,
    lineTotal: product.sellingPrice * quantity,
  }));

  return {
    items,
    totalAmount: items.reduce((sum, item) => sum + item.lineTotal, 0),
  };
};

export const calculateCustomerBalance = (entries: LedgerBalanceEntry[]) =>
  entries.reduce((sum, entry) => {
    if (entry.entryType === "debt") {
      return sum + entry.totalAmount;
    }

    return sum - entry.paymentAmount;
  }, 0);
