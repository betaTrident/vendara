import { multiplyMoney, sumMoney } from "@/lib/domain/money";

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
    lineTotal: multiplyMoney(product.sellingPrice, quantity),
  }));

  return {
    items,
    totalAmount: sumMoney(items.map((item) => item.lineTotal)),
  };
};

export const calculateCustomerBalance = (entries: LedgerBalanceEntry[]) =>
  entries.reduce((sum, entry) => {
    if (entry.entryType === "debt") {
      return sum + entry.totalAmount;
    }

    return sum - entry.paymentAmount;
  }, 0);

export type LedgerEntryViewLike = {
  id: string;
  entryType: "debt" | "payment";
  entryDate: string;
  totalAmount: number | null;
  paymentAmount: number | null;
  voidedAt: string | null;
  runningBalance?: number;
};

export type LedgerEntryTypeFilter = "all" | "debt" | "payment";

export type BalanceTrendPoint = {
  at: string;
  balance: number;
};

export const summarizeLedgerView = (entries: LedgerEntryViewLike[]) => {
  let totalPurchases = 0;
  let totalPayments = 0;
  let lastActivity: string | null = null;

  for (const entry of entries) {
    if (entry.voidedAt) {
      continue;
    }

    if (entry.entryType === "payment") {
      totalPayments += entry.paymentAmount ?? 0;
    } else {
      totalPurchases += entry.totalAmount ?? 0;
    }

    if (!lastActivity || entry.entryDate > lastActivity) {
      lastActivity = entry.entryDate;
    }
  }

  const newestActive = entries
    .filter((entry) => !entry.voidedAt)
    .reduce<LedgerEntryViewLike | null>((latest, entry) => {
      if (!latest) {
        return entry;
      }

      if (entry.entryDate > latest.entryDate) {
        return entry;
      }

      if (entry.entryDate === latest.entryDate && entry.id > latest.id) {
        return entry;
      }

      return latest;
    }, null);

  return {
    totalPurchases,
    totalPayments,
    lastActivity,
    currentBalance: newestActive?.runningBalance ?? null,
  };
};

export const filterLedgerEntries = <T extends LedgerEntryViewLike>(
  entries: T[],
  options: {
    entryType?: LedgerEntryTypeFilter;
    fromDate?: string;
    toDate?: string;
  } = {},
): T[] => {
  const entryType = options.entryType ?? "all";

  return entries.filter((entry) => {
    if (entryType !== "all" && entry.entryType !== entryType) {
      return false;
    }

    if (options.fromDate && entry.entryDate < options.fromDate) {
      return false;
    }

    if (options.toDate && entry.entryDate > options.toDate) {
      return false;
    }

    return true;
  });
};

export const buildBalanceTrendSeries = (
  entries: LedgerEntryViewLike[],
): BalanceTrendPoint[] => {
  const active = entries.filter(
    (entry) => !entry.voidedAt && entry.runningBalance != null,
  );

  const chronological = [...active].sort((left, right) => {
    const dateCompare = left.entryDate.localeCompare(right.entryDate);
    if (dateCompare !== 0) {
      return dateCompare;
    }

    return left.id.localeCompare(right.id);
  });

  return chronological.map((entry) => ({
    at: entry.entryDate,
    balance: entry.runningBalance!,
  }));
};
