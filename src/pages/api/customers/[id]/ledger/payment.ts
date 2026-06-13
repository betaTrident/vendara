import type { APIRoute } from "astro";
import { ZodError } from "zod";

import { jsonError, jsonOk } from "@/lib/api";
import { requireTrustedAdmin } from "@/lib/auth/admin";
import { createCustomerLedgerService } from "@/lib/services/customer-ledger";
import { createPaymentEntry } from "@/lib/server/ledger-repository";
import { ledgerPaymentSchema } from "@/lib/validation";

const customerLedgerService = createCustomerLedgerService({
  getProductsByIds: async () => [],
  createDebtEntry: async () => ({ id: "" }),
  createDebtItems: async () => {},
  createPaymentEntry,
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
    const data = ledgerPaymentSchema.parse(await request.json());
    await customerLedgerService.createPayment({
      customerId: params.id,
      entryDate: data.entryDate,
      paymentAmount: data.paymentAmount,
      note: data.note ?? null,
    });

    return jsonOk({ created: true }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError("Invalid payment payload.", 400, error.flatten());
    }

    return jsonError("Unable to create payment entry.", 500);
  }
};
