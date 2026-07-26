import { describe, expect, it } from "vitest";

import {
  canSubmitPayment,
  canSubmitPurchase,
  filterProductsForPicker,
  getRecentPayments,
  previewBalanceAfterPurchase,
  previewPaymentBalance,
  previewPurchase,
} from "@/lib/domain/transactions";
import type { LedgerEntry, Product } from "@/lib/types";

const products: Product[] = [
  {
    id: "11111111-1111-4111-8111-111111111111",
    name: "Coke",
    costPrice: 15,
    sellingPrice: 20,
    note: null,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Bread",
    costPrice: 10,
    sellingPrice: 15,
    note: null,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
  },
];

describe("transactions domain", () => {
  it("previews purchase lines from server product prices", () => {
    const preview = previewPurchase(
      [
        { productId: products[0].id, quantity: 2 },
        { productId: products[1].id, quantity: 1 },
      ],
      products,
    );

    expect(preview.subtotal).toBe(55);
    expect(preview.itemCount).toBe(3);
    expect(preview.lines).toEqual([
      {
        productId: products[0].id,
        productName: "Coke",
        unitPrice: 20,
        quantity: 2,
        lineTotal: 40,
      },
      {
        productId: products[1].id,
        productName: "Bread",
        unitPrice: 15,
        quantity: 1,
        lineTotal: 15,
      },
    ]);
  });

  it("ignores incomplete purchase rows", () => {
    const preview = previewPurchase(
      [
        { productId: "", quantity: 1 },
        { productId: products[0].id, quantity: 0 },
        { productId: products[0].id, quantity: "2" },
      ],
      products,
    );

    expect(preview.subtotal).toBe(40);
    expect(preview.lines).toHaveLength(1);
  });

  it("previews balance after purchase", () => {
    expect(previewBalanceAfterPurchase(1250, 147)).toBe(1397);
  });

  it("previews payment balance and flags overpayment", () => {
    expect(previewPaymentBalance(1250, 500)).toEqual({
      previousBalance: 1250,
      paymentAmount: 500,
      resultingBalance: 750,
      isOverpayment: false,
    });

    expect(previewPaymentBalance(50, 75).isOverpayment).toBe(true);
  });

  it("filters products for picker search", () => {
    expect(filterProductsForPicker(products, "coke")).toHaveLength(1);
    expect(filterProductsForPicker(products, "")).toHaveLength(2);
  });

  it("returns recent non-voided payments newest first", () => {
    const entries: LedgerEntry[] = [
      {
        id: "a",
        customerId: "c1",
        entryType: "payment",
        paymentAmount: 10,
        totalAmount: null,
        note: null,
        entryDate: "2026-06-10",
        idempotencyKey: null,
        voidedAt: null,
        voidedBy: null,
        voidReason: null,
        createdAt: "2026-06-10",
        updatedAt: "2026-06-10",
        items: [],
      },
      {
        id: "b",
        customerId: "c1",
        entryType: "debt",
        paymentAmount: null,
        totalAmount: 100,
        note: null,
        entryDate: "2026-06-11",
        idempotencyKey: null,
        voidedAt: null,
        voidedBy: null,
        voidReason: null,
        createdAt: "2026-06-11",
        updatedAt: "2026-06-11",
        items: [],
      },
      {
        id: "c",
        customerId: "c1",
        entryType: "payment",
        paymentAmount: 25,
        totalAmount: null,
        note: null,
        entryDate: "2026-06-12",
        idempotencyKey: null,
        voidedAt: null,
        voidedBy: null,
        voidReason: null,
        createdAt: "2026-06-12",
        updatedAt: "2026-06-12",
        items: [],
      },
      {
        id: "d",
        customerId: "c1",
        entryType: "payment",
        paymentAmount: 5,
        totalAmount: null,
        note: null,
        entryDate: "2026-06-12",
        idempotencyKey: null,
        voidedAt: "2026-06-13",
        voidedBy: null,
        voidReason: null,
        createdAt: "2026-06-12",
        updatedAt: "2026-06-13",
        items: [],
      },
    ];

    expect(getRecentPayments(entries, 2).map((entry) => entry.id)).toEqual([
      "c",
      "a",
    ]);
  });

  it("blocks purchase and payment submission when invalid or offline", () => {
    expect(canSubmitPurchase({ lines: [], subtotal: 0, itemCount: 0 })).toBe(
      false,
    );
    expect(
      canSubmitPurchase({
        lines: [
          {
            productId: products[0].id,
            productName: "Coke",
            unitPrice: 20,
            quantity: 1,
            lineTotal: 20,
          },
        ],
        subtotal: 20,
        itemCount: 1,
      }),
    ).toBe(true);

    expect(
      canSubmitPayment(
        {
          previousBalance: 100,
          paymentAmount: 50,
          resultingBalance: 50,
          isOverpayment: false,
        },
        true,
      ),
    ).toBe(true);

    expect(
      canSubmitPayment(
        {
          previousBalance: 50,
          paymentAmount: 75,
          resultingBalance: -25,
          isOverpayment: true,
        },
        true,
      ),
    ).toBe(false);

    expect(
      canSubmitPayment(
        {
          previousBalance: 50,
          paymentAmount: 25,
          resultingBalance: 25,
          isOverpayment: false,
        },
        false,
      ),
    ).toBe(false);
  });
});
