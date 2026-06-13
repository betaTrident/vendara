import type { APIRoute } from "astro";
import { ZodError } from "zod";

import { jsonError, jsonOk } from "@/lib/api";
import { requireTrustedAdmin } from "@/lib/auth/admin";
import { createCustomerLedgerService } from "@/lib/services/customer-ledger";
import {
  createDebtEntry,
  createDebtItems,
  getProductsByIds,
} from "@/lib/server/ledger-repository";
import { ledgerDebtSchema } from "@/lib/validation";

const customerLedgerService = createCustomerLedgerService({
  getProductsByIds,
  createDebtEntry,
  createDebtItems,
  createPaymentEntry: async () => {},
});

export const POST: APIRoute = async ({ params, request }) => {
  const admin = await requireTrustedAdmin(request);

  if (admin instanceof Response) {
    return admin;
  }

  if (!params.id) {
    return jsonError("Missing customer ID.");
  }

  try {
    const data = ledgerDebtSchema.parse(await request.json());
    const result = await customerLedgerService.createDebt({
      customerId: params.id,
      entryDate: data.entryDate,
      note: data.note ?? null,
      items: data.items,
    });

    return jsonOk(result, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError("Invalid debt payload.", 400, error.flatten());
    }

    return jsonError(
      error instanceof Error ? error.message : "Unable to create debt entry.",
      500,
    );
  }
};
