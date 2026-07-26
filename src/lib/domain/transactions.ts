import { multiplyMoney, parseMoney, sumMoney } from "@/lib/domain/money";
import type { LedgerEntry, Product } from "@/lib/types";

export type PurchaseLineDraft = {
  productId: string;
  quantity: number | string;
};

export type PurchaseLinePreview = {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
};

export type PurchasePreview = {
  lines: PurchaseLinePreview[];
  subtotal: number;
  itemCount: number;
};

export type PaymentBalancePreview = {
  previousBalance: number;
  paymentAmount: number;
  resultingBalance: number;
  isOverpayment: boolean;
};

const parsePositiveQuantity = (value: number | string): number | null => {
  const quantity = typeof value === "number" ? value : Number(value);
  if (!Number.isInteger(quantity) || quantity <= 0) {
    return null;
  }

  return quantity;
};

export const previewPurchase = (
  rows: PurchaseLineDraft[],
  products: Product[],
): PurchasePreview => {
  const productsById = new Map(products.map((product) => [product.id, product]));
  const lines: PurchaseLinePreview[] = [];

  for (const row of rows) {
    if (!row.productId) {
      continue;
    }

    const quantity = parsePositiveQuantity(row.quantity);
    const product = productsById.get(row.productId);
    if (!product || quantity === null) {
      continue;
    }

    lines.push({
      productId: product.id,
      productName: product.name,
      unitPrice: product.sellingPrice,
      quantity,
      lineTotal: multiplyMoney(product.sellingPrice, quantity),
    });
  }

  return {
    lines,
    subtotal: sumMoney(lines.map((line) => line.lineTotal)),
    itemCount: lines.reduce((count, line) => count + line.quantity, 0),
  };
};

export const previewBalanceAfterPurchase = (
  currentBalance: number,
  purchaseTotal: number,
): number => parseMoney(currentBalance) + parseMoney(purchaseTotal);

export const previewPaymentBalance = (
  currentBalance: number,
  paymentAmount: number | string,
): PaymentBalancePreview => {
  const previousBalance = parseMoney(currentBalance);
  let amount = 0;

  try {
    amount = parseMoney(
      typeof paymentAmount === "number"
        ? paymentAmount
        : paymentAmount.trim() === ""
          ? 0
          : paymentAmount,
    );
  } catch {
    amount = 0;
  }

  return {
    previousBalance,
    paymentAmount: amount,
    resultingBalance: previousBalance - amount,
    isOverpayment: amount > previousBalance,
  };
};

export const filterProductsForPicker = (
  products: Product[],
  query: string,
): Product[] => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return products;
  }

  return products.filter((product) =>
    product.name.toLowerCase().includes(normalized),
  );
};

export const getRecentPayments = (
  entries: LedgerEntry[],
  limit = 5,
): LedgerEntry[] => {
  return entries
    .filter(
      (entry) => entry.entryType === "payment" && entry.voidedAt === null,
    )
    .sort((left, right) => {
      const dateCompare = right.entryDate.localeCompare(left.entryDate);
      if (dateCompare !== 0) {
        return dateCompare;
      }

      return right.id.localeCompare(left.id);
    })
    .slice(0, limit);
};

export const canSubmitPurchase = (preview: PurchasePreview): boolean =>
  preview.lines.length > 0 && preview.subtotal > 0;

export const canSubmitPayment = (
  preview: PaymentBalancePreview,
  isOnline: boolean,
): boolean =>
  isOnline &&
  preview.paymentAmount > 0 &&
  !preview.isOverpayment &&
  Number.isFinite(preview.paymentAmount);
