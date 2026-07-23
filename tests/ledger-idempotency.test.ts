import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createDebtEntryWithItems,
  createPaymentEntry,
  IdempotencyConflictError,
} from "@/lib/server/ledger-repository";

const transaction = vi.fn();
const sql = vi.fn().mockResolvedValue([]);

Object.assign(sql, { transaction });

vi.mock("@/lib/db/client", () => ({
  getSql: () => sql,
}));

vi.mock("@/lib/server/formatters", () => ({
  mapLedgerEntryRow: (row: Record<string, unknown>) => ({
    id: String(row.id),
    customerId: String(row.customer_id),
    entryType: String(row.entry_type),
    paymentAmount: row.payment_amount === null ? null : Number(row.payment_amount),
    totalAmount: row.total_amount === null ? null : Number(row.total_amount),
    note: (row.note as string | null) ?? null,
    entryDate: String(row.entry_date),
    idempotencyKey: row.idempotency_key ? String(row.idempotency_key) : null,
    voidedAt: null,
    voidedBy: null,
    voidReason: null,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    items: [],
  }),
  mapLedgerItemRow: (row: Record<string, unknown>) => ({
    id: String(row.id),
    ledgerEntryId: String(row.ledger_entry_id),
    productId: String(row.product_id),
    productNameSnapshot: String(row.product_name_snapshot),
    unitCostPriceSnapshot: Number(row.unit_cost_price_snapshot),
    unitSellingPriceSnapshot: Number(row.unit_selling_price_snapshot),
    quantity: Number(row.quantity),
    lineTotal: Number(row.line_total),
  }),
  mapProductRow: vi.fn(),
}));

describe("ledger idempotency", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sql.mockResolvedValue([]);
    transaction.mockReset();
  });

  it("commits new debt entries in one transaction", async () => {
    transaction.mockResolvedValueOnce([{ id: "entry-new" }]);

    const result = await createDebtEntryWithItems({
      customerId: "customer-1",
      entryDate: "2026-06-13",
      note: null,
      totalAmount: 20,
      idempotencyKey: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      items: [
        {
          productId: "product-1",
          productNameSnapshot: "Coke",
          unitCostPriceSnapshot: 10,
          unitSellingPriceSnapshot: 20,
          quantity: 1,
          lineTotal: 20,
        },
      ],
    });

    expect(transaction).toHaveBeenCalledTimes(1);
    expect(result.id).toBeTruthy();
  });

  it("rejects reused idempotency keys with different payment payloads", async () => {
    const uniqueError = Object.assign(new Error("duplicate key"), { code: "23505" });
    sql.mockRejectedValueOnce(uniqueError);
    sql.mockResolvedValueOnce([
      {
        id: "entry-existing",
        customer_id: "customer-1",
        entry_type: "payment",
        payment_amount: 25,
        total_amount: null,
        note: null,
        entry_date: "2026-06-13",
        idempotency_key: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      },
    ]);

    await expect(
      createPaymentEntry({
        customerId: "customer-1",
        entryDate: "2026-06-13",
        paymentAmount: 50,
        note: null,
        idempotencyKey: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
      }),
    ).rejects.toBeInstanceOf(IdempotencyConflictError);
  });
});
