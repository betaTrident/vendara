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
  idempotencyKey: string | null;
  voidedAt: string | null;
  voidedBy: string | null;
  voidReason: string | null;
  createdAt: string;
  updatedAt: string;
  items: LedgerEntryItem[];
  runningBalance?: number;
};

export type OverviewActivityKind =
  | "payment"
  | "purchase"
  | "price_change"
  | "customer_created";

export type OverviewActivityItem = {
  id: string;
  kind: OverviewActivityKind;
  title: string;
  detail: string;
  occurredAt: string;
};

export type OverviewBalanceItem = {
  customerId: string;
  customerName: string;
  balance: number;
};

export type OverviewAgingBucket = {
  id: "current" | "late-1-7" | "late-8-30" | "late-30-plus";
  label: string;
  customerCount: number;
};

export type OwnerSummary = {
  activeProductCount: number;
  customerCount: number;
  customersWithBalanceCount: number;
  totalOutstanding: number;
  recentActivity: OverviewActivityItem[];
  topBalances: OverviewBalanceItem[];
  agingBuckets: OverviewAgingBucket[];
};
