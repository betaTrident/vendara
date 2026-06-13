import { describe, expect, it } from "vitest";

import {
  buildDebtEntrySnapshot,
  calculateCustomerBalance,
} from "@/lib/domain/ledger";

describe("ledger domain", () => {
  it("builds debt entry snapshots using current product prices", () => {
    const result = buildDebtEntrySnapshot([
      {
        product: {
          id: "product-1",
          name: "3 in 1 Coffee",
          costPrice: 8,
          sellingPrice: 12,
        },
        quantity: 2,
      },
      {
        product: {
          id: "product-2",
          name: "Bread",
          costPrice: 10,
          sellingPrice: 15,
        },
        quantity: 1,
      },
    ]);

    expect(result.totalAmount).toBe(39);
    expect(result.items).toEqual([
      {
        productId: "product-1",
        productNameSnapshot: "3 in 1 Coffee",
        unitCostPriceSnapshot: 8,
        unitSellingPriceSnapshot: 12,
        quantity: 2,
        lineTotal: 24,
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
  });

  it("calculates running balance as total debt minus total payments", () => {
    expect(
      calculateCustomerBalance([
        {
          entryType: "debt",
          totalAmount: 120,
        },
        {
          entryType: "debt",
          totalAmount: 80,
        },
        {
          entryType: "payment",
          paymentAmount: 50,
        },
      ]),
    ).toBe(150);
  });
});
