import type { APIRoute } from "astro";
import { ZodError } from "zod";

import { jsonError, jsonOk } from "@/lib/api";
import { requireTrustedAdmin } from "@/lib/auth/admin";
import { buildDebtEntrySnapshot } from "@/lib/domain/ledger";
import {
  deleteLedgerEntry,
  getLedgerEntryById,
  getProductsByIds,
  replaceDebtEntry,
  updatePaymentEntry,
} from "@/lib/server/ledger-repository";
import { ledgerUpdateSchema } from "@/lib/validation";

export const PUT: APIRoute = async ({ params, request }) => {
  const admin = await requireTrustedAdmin(request);

  if (admin instanceof Response) {
    return admin;
  }

  if (!params.entryId) {
    return jsonError("Missing ledger entry ID.");
  }

  const existing = await getLedgerEntryById(params.entryId);

  if (!existing) {
    return jsonError("Ledger entry not found.", 404);
  }

  try {
    const data = ledgerUpdateSchema.parse(await request.json());

    if (data.entryType === "payment") {
      await updatePaymentEntry({
        entryId: params.entryId,
        entryDate: data.entryDate,
        paymentAmount: data.paymentAmount,
        note: data.note ?? null,
      });
    } else {
      const products = await getProductsByIds(
        data.items.map((item) => item.productId),
      );
      const productsById = new Map(products.map((product) => [product.id, product]));
      const snapshot = buildDebtEntrySnapshot(
        data.items.map((item) => ({
          product: productsById.get(item.productId)!,
          quantity: item.quantity,
        })),
      );

      await replaceDebtEntry({
        entryId: params.entryId,
        entryDate: data.entryDate,
        note: data.note ?? null,
        totalAmount: snapshot.totalAmount,
        items: snapshot.items,
      });
    }

    return jsonOk({ updated: true, entryType: existing.entryType });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError("Invalid ledger payload.", 400, error.flatten());
    }

    return jsonError(
      error instanceof Error ? error.message : "Unable to update ledger entry.",
      500,
    );
  }
};

export const DELETE: APIRoute = async ({ params, request }) => {
  const admin = await requireTrustedAdmin(request);

  if (admin instanceof Response) {
    return admin;
  }

  if (!params.entryId) {
    return jsonError("Missing ledger entry ID.");
  }

  await deleteLedgerEntry(params.entryId);

  return jsonOk({ deleted: true });
};
