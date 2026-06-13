import { describe, expect, it, vi } from "vitest";

import { createCustomerLedgerService } from "@/lib/services/customer-ledger";

describe("customer ledger service", () => {
  it("creates a debt entry with price snapshots and totals", async () => {
    const createDebtEntry = vi.fn().mockResolvedValue({ id: "entry-1" });
    const createDebtItems = vi.fn();
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
      createDebtEntry,
      createDebtItems,
      createPaymentEntry: vi.fn(),
      getProductsByIds,
    });

    const result = await service.createDebt({
      customerId: "customer-1",
      entryDate: "2026-06-13",
      note: "morning items",
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

    expect(createDebtEntry).toHaveBeenCalledWith({
      customerId: "customer-1",
      entryDate: "2026-06-13",
      note: "morning items",
      totalAmount: 55,
    });
    expect(createDebtItems).toHaveBeenCalledWith("entry-1", [
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
    ]);
    expect(result.totalAmount).toBe(55);
  });

  it("creates a payment entry without line items", async () => {
    const createPaymentEntry = vi.fn();

    const service = createCustomerLedgerService({
      createPaymentEntry,
      createDebtEntry: vi.fn(),
      createDebtItems: vi.fn(),
      getProductsByIds: vi.fn(),
    });

    await service.createPayment({
      customerId: "customer-1",
      entryDate: "2026-06-13",
      paymentAmount: 100,
      note: "partial payment",
    });

    expect(createPaymentEntry).toHaveBeenCalledWith({
      customerId: "customer-1",
      entryDate: "2026-06-13",
      paymentAmount: 100,
      note: "partial payment",
    });
  });
});
