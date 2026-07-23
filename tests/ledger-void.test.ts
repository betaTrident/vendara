import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  LedgerEntryAlreadyVoidedError,
  voidLedgerEntry,
} from "@/lib/server/ledger-repository";

const sql = vi.fn().mockResolvedValue([]);

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
    note: null,
    entryDate: "2026-06-13",
    idempotencyKey: null,
    voidedAt: row.voided_at ? String(row.voided_at) : null,
    voidedBy: null,
    voidReason: null,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    items: [],
  }),
  mapLedgerItemRow: vi.fn(),
  mapProductRow: vi.fn(),
}));

describe("ledger voiding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sql.mockResolvedValue([]);
  });

  it("voids an active entry and returns the recalculated balance", async () => {
    sql
      .mockResolvedValueOnce([
        {
          id: "entry-1",
          customer_id: "customer-1",
          entry_type: "debt",
          payment_amount: null,
          total_amount: 40,
          voided_at: null,
        },
      ])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([{ customer_id: "customer-1" }])
      .mockResolvedValueOnce([{ balance: "0" }]);

    const result = await voidLedgerEntry({
      entryId: "entry-1",
      voidedBy: "owner@example.com",
      reason: "Wrong quantity",
    });

    expect(result).toEqual({
      customerId: "customer-1",
      balance: 0,
    });
  });

  it("rejects repeat void attempts", async () => {
    sql
      .mockResolvedValueOnce([
        {
          id: "entry-1",
          customer_id: "customer-1",
          entry_type: "debt",
          payment_amount: null,
          total_amount: 40,
          voided_at: "2026-06-13T00:00:00.000Z",
        },
      ])
      .mockResolvedValueOnce([]);

    await expect(
      voidLedgerEntry({
        entryId: "entry-1",
        voidedBy: "owner@example.com",
        reason: "Again",
      }),
    ).rejects.toBeInstanceOf(LedgerEntryAlreadyVoidedError);
  });
});
