import { buildDebtEntrySnapshot } from "@/lib/domain/ledger";
import { PaymentExceedsBalanceError } from "@/lib/server/ledger-repository";
import { parseMoney } from "@/lib/domain/money";

type ProductLookup = {
  id: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
};

export const createCustomerLedgerService = (dependencies: {
  getProductsByIds: (productIds: string[]) => Promise<ProductLookup[]>;
  getCustomerOutstandingBalance?: (customerId: string) => Promise<number>;
  createDebtWithItems: (input: {
    customerId: string;
    entryDate: string;
    note: string | null;
    totalAmount: number;
    idempotencyKey: string;
    items: Array<{
      productId: string;
      productNameSnapshot: string;
      unitCostPriceSnapshot: number;
      unitSellingPriceSnapshot: number;
      quantity: number;
      lineTotal: number;
    }>;
  }) => Promise<{ id: string }> | { id: string };
  createPaymentEntry: (input: {
    customerId: string;
    entryDate: string;
    paymentAmount: number;
    note: string | null;
    idempotencyKey: string;
  }) => Promise<{ id: string }> | { id: string };
}) => ({
  async createDebt(input: {
    customerId: string;
    entryDate: string;
    note: string | null;
    idempotencyKey: string;
    items: Array<{
      productId: string;
      quantity: number;
    }>;
  }) {
    const products = await dependencies.getProductsByIds(
      input.items.map((item) => item.productId),
    );
    const productsById = new Map(products.map((product) => [product.id, product]));

    const snapshot = buildDebtEntrySnapshot(
      input.items.map((item) => ({
        product:
          productsById.get(item.productId) ??
          (() => {
            throw new Error(`Product not found: ${item.productId}`);
          })(),
        quantity: item.quantity,
      })),
    );

    const created = await dependencies.createDebtWithItems({
      customerId: input.customerId,
      entryDate: input.entryDate,
      note: input.note,
      totalAmount: snapshot.totalAmount,
      idempotencyKey: input.idempotencyKey,
      items: snapshot.items,
    });

    return {
      ...snapshot,
      id: created.id,
    };
  },

  async createPayment(input: {
    customerId: string;
    entryDate: string;
    paymentAmount: number;
    note: string | null;
    idempotencyKey: string;
  }) {
    if (dependencies.getCustomerOutstandingBalance) {
      const outstanding = await dependencies.getCustomerOutstandingBalance(
        input.customerId,
      );

      if (parseMoney(input.paymentAmount) > parseMoney(outstanding)) {
        throw new PaymentExceedsBalanceError();
      }
    }

    const created = await dependencies.createPaymentEntry(input);

    return {
      id: created.id,
    };
  },
});
