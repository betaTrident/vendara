import { describe, expect, it, vi } from "vitest";

import { createCustomerLedgerService } from "@/lib/services/customer-ledger";

describe("customer ledger service", () => {
  it("creates a debt entry with price snapshots and totals", async () => {
    const createDebtWithItems = vi.fn().mockResolvedValue({ id: "entry-1" });
    const getProductsByIds = vi.fn().mockResolvedValue([
      {
        id: "product-1",
        name: "Coke",
        costPrice: 15,
        sellingPrice: 20,
      },
      {
        id: "product-2",
        name: "Bread",
        costPrice: 10,
        sellingPrice: 15,
      },
    ]);

    const service = createCustomerLedgerService({
      createDebtWithItems,
      createPaymentEntry: vi.fn(),
      getProductsByIds,
    });

    const result = await service.createDebt({
      customerId: "customer-1",
      entryDate: "2026-06-13",
      note: "morning items",
      idempotencyKey: "33333333-3333-4333-8333-333333333333",
      items: [
        {
          productId: "product-1",
          quantity: 2,
        },
        {
          productId: "product-2",
          quantity: 1,
        },
      ],
    });

    expect(createDebtWithItems).toHaveBeenCalledWith({
      customerId: "customer-1",
      entryDate: "2026-06-13",
      note: "morning items",
      totalAmount: 55,
      idempotencyKey: "33333333-3333-4333-8333-333333333333",
      items: [
        {
          productId: "product-1",
          productNameSnapshot: "Coke",
          unitCostPriceSnapshot: 15,
          unitSellingPriceSnapshot: 20,
          quantity: 2,
          lineTotal: 40,
        },
        {
          productId: "product-2",
          productNameSnapshot: "Bread",
          unitCostPriceSnapshot: 10,
          unitSellingPriceSnapshot: 15,
          quantity: 1,
          lineTotal: 15,
        },
      ],
    });
    expect(result.totalAmount).toBe(55);
  });

  it("creates a payment entry without line items", async () => {
    const createPaymentEntry = vi.fn().mockResolvedValue({ id: "payment-1" });

    const service = createCustomerLedgerService({
      createPaymentEntry,
      createDebtWithItems: vi.fn(),
      getProductsByIds: vi.fn(),
    });

    await service.createPayment({
      customerId: "customer-1",
      entryDate: "2026-06-13",
      paymentAmount: 100,
      note: "partial payment",
      idempotencyKey: "44444444-4444-4444-8444-444444444444",
    });

    expect(createPaymentEntry).toHaveBeenCalledWith({
      customerId: "customer-1",
      entryDate: "2026-06-13",
      paymentAmount: 100,
      note: "partial payment",
      idempotencyKey: "44444444-4444-4444-8444-444444444444",
    });
  });

  it("rejects payments above the outstanding balance", async () => {
    const service = createCustomerLedgerService({
      createPaymentEntry: vi.fn(),
      createDebtWithItems: vi.fn(),
      getProductsByIds: vi.fn(),
      getCustomerOutstandingBalance: vi.fn().mockResolvedValue(50),
    });

    await expect(
      service.createPayment({
        customerId: "customer-1",
        entryDate: "2026-06-13",
        paymentAmount: 75,
        note: null,
        idempotencyKey: "55555555-5555-4555-8555-555555555555",
      }),
    ).rejects.toThrow("outstanding balance");
  });
});
