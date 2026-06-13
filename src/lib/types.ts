export type Product = {
  id: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PriceHistoryItem = {
  id: string;
  productId: string;
  oldCostPrice: number;
  newCostPrice: number;
  oldSellingPrice: number;
  newSellingPrice: number;
  changedAt: string;
};

export type Customer = {
  id: string;
  name: string;
  note: string | null;
  balance: number;
  createdAt: string;
  updatedAt: string;
};

export type LedgerEntryType = "debt" | "payment";

export type LedgerEntryItem = {
  id: string;
  ledgerEntryId: string;
  productId: string;
  productNameSnapshot: string;
  unitCostPriceSnapshot: number;
  unitSellingPriceSnapshot: number;
  quantity: number;
  lineTotal: number;
};

export type LedgerEntry = {
  id: string;
  customerId: string;
  entryType: LedgerEntryType;
  paymentAmount: number | null;
  totalAmount: number | null;
  note: string | null;
  entryDate: string;
  createdAt: string;
  updatedAt: string;
  items: LedgerEntryItem[];
  runningBalance?: number;
};
