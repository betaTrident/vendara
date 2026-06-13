import { z } from "zod";

export const productSchema = z.object({
  name: z.string().trim().min(1, "Product name is required."),
  costPrice: z.coerce.number().min(0, "Cost price must be 0 or higher."),
  sellingPrice: z.coerce.number().min(0, "Selling price must be 0 or higher."),
  note: z.string().trim().max(255).optional().nullable(),
});

export const customerSchema = z.object({
  name: z.string().trim().min(1, "Customer name is required."),
  note: z.string().trim().max(255).optional().nullable(),
});

export const ledgerDebtSchema = z.object({
  entryDate: z.string().date("Entry date is required."),
  note: z.string().trim().max(255).optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid("Product ID must be a UUID."),
        quantity: z.coerce.number().int().positive("Quantity must be greater than 0."),
      }),
    )
    .min(1, "At least one product is required."),
});

export const ledgerPaymentSchema = z.object({
  entryDate: z.string().date("Entry date is required."),
  paymentAmount: z.coerce.number().positive("Payment amount must be greater than 0."),
  note: z.string().trim().max(255).optional().nullable(),
});

export const ledgerUpdateSchema = z.discriminatedUnion("entryType", [
  z.object({
    entryType: z.literal("debt"),
    entryDate: z.string().date("Entry date is required."),
    note: z.string().trim().max(255).optional().nullable(),
    items: z
      .array(
        z.object({
          productId: z.string().uuid("Product ID must be a UUID."),
          quantity: z.coerce.number().int().positive("Quantity must be greater than 0."),
        }),
      )
      .min(1, "At least one product is required."),
  }),
  z.object({
    entryType: z.literal("payment"),
    entryDate: z.string().date("Entry date is required."),
    paymentAmount: z.coerce.number().positive("Payment amount must be greater than 0."),
    note: z.string().trim().max(255).optional().nullable(),
  }),
]);
