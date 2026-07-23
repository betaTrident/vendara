import { beforeEach, describe, expect, it, vi } from "vitest";

import { updateCustomer } from "@/lib/server/customers-repository";
import {
  createDebtEntryWithItems,
} from "@/lib/server/ledger-repository";
import { saveProductUpdateWithPriceHistory } from "@/lib/server/products-repository";

const transaction = vi.fn();
const sql = vi.fn().mockResolvedValue([]);
Object.assign(sql, { transaction });

vi.mock("@/lib/db/client", () => ({
  getSql: () => sql,
}));

vi.mock("@/lib/server/formatters", () => ({
  mapProductRow: (row: Record<string, unknown>) => ({
    id: String(row.id),
    name: String(row.name),
    costPrice: Number(row.cost_price),
    sellingPrice: Number(row.selling_price),
    note: row.note as string | null,
    isActive: true,
  }),
  mapCustomerRow: (row: Record<string, unknown>) => ({
    id: String(row.id),
    name: String(row.name),
    note: row.note as string | null,
    balance: Number(row.balance ?? 0),
    isActive: true,
  }),
}));

describe("repository transactions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sql.mockResolvedValue([]);
    transaction.mockReset();
  });

  it("writes debt headers and items in one database transaction", async () => {
    transaction.mockResolvedValueOnce([{ id: "entry-1" }]);

    await createDebtEntryWithItems({
      customerId: "customer-1",
      entryDate: "2026-06-13",
      note: null,
      totalAmount: 55,
      idempotencyKey: "11111111-1111-4111-8111-111111111111",
      items: [
        {
          productId: "product-1",
          productNameSnapshot: "Coke",
          unitCostPriceSnapshot: 15,
          unitSellingPriceSnapshot: 20,
          quantity: 2,
          lineTotal: 40,
        },
      ],
    });

    expect(transaction).toHaveBeenCalledTimes(1);
    const batch = transaction.mock.calls[0][0];
    expect(Array.isArray(batch)).toBe(true);
    expect(batch.length).toBe(2);
  });

  it("rolls back debt writes when the item batch fails", async () => {
    transaction.mockRejectedValueOnce(new Error("insert into ledger_entry_items failed"));

    await expect(
      createDebtEntryWithItems({
        customerId: "customer-1",
        entryDate: "2026-06-13",
        note: null,
        totalAmount: 10,
        idempotencyKey: "22222222-2222-4222-8222-222222222222",
        items: [
          {
            productId: "product-1",
            productNameSnapshot: "Coke",
            unitCostPriceSnapshot: 15,
            unitSellingPriceSnapshot: 20,
            quantity: 1,
            lineTotal: 20,
          },
        ],
      }),
    ).rejects.toThrow("insert into ledger_entry_items failed");
  });

  it("writes product updates and price history in one database transaction", async () => {
    transaction.mockResolvedValueOnce([
      [],
      [
        {
          id: "product-1",
          name: "Coffee",
          cost_price: 12,
          selling_price: 18,
          note: null,
        },
      ],
    ]);

    await saveProductUpdateWithPriceHistory({
      id: "product-1",
      next: {
        name: "Coffee",
        costPrice: 12,
        sellingPrice: 18,
        note: null,
      },
      priceHistory: {
        productId: "product-1",
        oldCostPrice: 10,
        newCostPrice: 12,
        oldSellingPrice: 15,
        newSellingPrice: 18,
      },
    });

    expect(transaction).toHaveBeenCalledTimes(1);
    const batch = transaction.mock.calls[0][0];
    expect(batch.length).toBe(2);
  });

  it("rolls back product updates when price history insertion fails", async () => {
    transaction.mockRejectedValueOnce(new Error("insert into price_history failed"));

    await expect(
      saveProductUpdateWithPriceHistory({
        id: "product-1",
        next: {
          name: "Coffee",
          costPrice: 12,
          sellingPrice: 18,
          note: null,
        },
        priceHistory: {
          productId: "product-1",
          oldCostPrice: 10,
          newCostPrice: 12,
          oldSellingPrice: 15,
          newSellingPrice: 18,
        },
      }),
    ).rejects.toThrow("insert into price_history failed");
  });

  it("returns the real customer balance after update", async () => {
    sql.mockResolvedValueOnce([]);
    sql.mockResolvedValueOnce([
      {
        id: "customer-1",
        name: "Ana",
        note: null,
        balance: 150,
        is_active: true,
      },
    ]);

    const customer = await updateCustomer({
      id: "customer-1",
      name: "Ana",
      note: null,
    });

    expect(customer.balance).toBe(150);
    expect(sql).toHaveBeenCalledTimes(2);
  });
});
