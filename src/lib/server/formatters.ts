import type {
  Customer,
  LedgerEntry,
  LedgerEntryItem,
  PriceHistoryItem,
  Product,
} from "@/lib/types";

const toNumber = (value: unknown) => Number(value ?? 0);
const toStringValue = (value: unknown) => String(value ?? "");

export const mapProductRow = (row: Record<string, unknown>): Product => ({
  id: toStringValue(row.id),
  name: toStringValue(row.name),
  costPrice: toNumber(row.cost_price),
  sellingPrice: toNumber(row.selling_price),
  note: (row.note as string | null) ?? null,
  createdAt: toStringValue(row.created_at),
  updatedAt: toStringValue(row.updated_at),
});

export const mapPriceHistoryRow = (
  row: Record<string, unknown>,
): PriceHistoryItem => ({
  id: toStringValue(row.id),
  productId: toStringValue(row.product_id),
  oldCostPrice: toNumber(row.old_cost_price),
  newCostPrice: toNumber(row.new_cost_price),
  oldSellingPrice: toNumber(row.old_selling_price),
  newSellingPrice: toNumber(row.new_selling_price),
  changedAt: toStringValue(row.changed_at),
});

export const mapCustomerRow = (row: Record<string, unknown>): Customer => ({
  id: toStringValue(row.id),
  name: toStringValue(row.name),
  note: (row.note as string | null) ?? null,
  balance: toNumber(row.balance),
  createdAt: toStringValue(row.created_at),
  updatedAt: toStringValue(row.updated_at),
});

export const mapLedgerEntryRow = (row: Record<string, unknown>): LedgerEntry => ({
  id: toStringValue(row.id),
  customerId: toStringValue(row.customer_id),
  entryType: toStringValue(row.entry_type) as "debt" | "payment",
  paymentAmount:
    row.payment_amount === null || row.payment_amount === undefined
      ? null
      : toNumber(row.payment_amount),
  totalAmount:
    row.total_amount === null || row.total_amount === undefined
      ? null
      : toNumber(row.total_amount),
  note: (row.note as string | null) ?? null,
  entryDate: toStringValue(row.entry_date),
  createdAt: toStringValue(row.created_at),
  updatedAt: toStringValue(row.updated_at),
  items: [],
});

export const mapLedgerItemRow = (
  row: Record<string, unknown>,
): LedgerEntryItem => ({
  id: toStringValue(row.id),
  ledgerEntryId: toStringValue(row.ledger_entry_id),
  productId: toStringValue(row.product_id),
  productNameSnapshot: toStringValue(row.product_name_snapshot),
  unitCostPriceSnapshot: toNumber(row.unit_cost_price_snapshot),
  unitSellingPriceSnapshot: toNumber(row.unit_selling_price_snapshot),
  quantity: toNumber(row.quantity),
  lineTotal: toNumber(row.line_total),
});
