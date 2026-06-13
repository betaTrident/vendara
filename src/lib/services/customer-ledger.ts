import { buildDebtEntrySnapshot } from "@/lib/domain/ledger";

type ProductLookup = {
  id: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
};

export const createCustomerLedgerService = (dependencies: {
  getProductsByIds: (productIds: string[]) => Promise<ProductLookup[]>;
  createDebtEntry: (input: {
    customerId: string;
    entryDate: string;
    note: string | null;
    totalAmount: number;
  }) => Promise<{ id: string }>;
  createDebtItems: (
    ledgerEntryId: string,
    items: Array<{
      productId: string;
      productNameSnapshot: string;
      unitCostPriceSnapshot: number;
      unitSellingPriceSnapshot: number;
      quantity: number;
      lineTotal: number;
    }>,
  ) => Promise<void> | void;
  createPaymentEntry: (input: {
    customerId: string;
    entryDate: string;
    paymentAmount: number;
    note: string | null;
  }) => Promise<void> | void;
}) => ({
  async createDebt(input: {
    customerId: string;
    entryDate: string;
    note: string | null;
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

    const ledgerEntry = await dependencies.createDebtEntry({
      customerId: input.customerId,
      entryDate: input.entryDate,
      note: input.note,
      totalAmount: snapshot.totalAmount,
    });

    await dependencies.createDebtItems(ledgerEntry.id, snapshot.items);

    return snapshot;
  },

  async createPayment(input: {
    customerId: string;
    entryDate: string;
    paymentAmount: number;
    note: string | null;
  }) {
    await dependencies.createPaymentEntry(input);
  },
});
