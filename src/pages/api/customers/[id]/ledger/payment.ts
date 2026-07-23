import type { APIRoute } from "astro";
import { ZodError } from "zod";

import {
  API_ERROR_CODES,
  jsonError,
  jsonOk,
  parseIdempotencyKey,
  resolveRequestId,
  toSafeErrorMessage,
} from "@/lib/api";
import { requireOwnerMutation } from "@/lib/auth/admin";
import { createCustomerLedgerService } from "@/lib/services/customer-ledger";
import {
  createPaymentEntry,
  getCustomerOutstandingBalance,
  IdempotencyConflictError,
  PaymentExceedsBalanceError,
} from "@/lib/server/ledger-repository";
import { ledgerPaymentSchema, parseRouteUuid } from "@/lib/validation";

const customerLedgerService = createCustomerLedgerService({
  getProductsByIds: async () => [],
  getCustomerOutstandingBalance,
  createDebtWithItems: async () => ({ id: "" }),
  createPaymentEntry,
});

export const POST: APIRoute = async ({ params, request }) => {
  const owner = await requireOwnerMutation(request);
  const requestId = resolveRequestId(request);

  if (owner instanceof Response) {
    return owner;
  }

  const idempotencyKey = parseIdempotencyKey(request);

  if (!idempotencyKey.ok) {
    return jsonError(
      API_ERROR_CODES.VALIDATION_ERROR,
      idempotencyKey.message,
      400,
      { requestId },
    );
  }

  const customerId = parseRouteUuid(params.id);

  if (!customerId.ok) {
    return jsonError(
      API_ERROR_CODES.VALIDATION_ERROR,
      "Customer ID must be a valid UUID.",
      400,
      { requestId },
    );
  }

  try {
    const data = ledgerPaymentSchema.parse(await request.json());
    const result = await customerLedgerService.createPayment({
      customerId: customerId.value,
      entryDate: data.entryDate,
      paymentAmount: data.paymentAmount,
      note: data.note ?? null,
      idempotencyKey: idempotencyKey.value,
    });

    return jsonOk(result, { status: 201, requestId });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError(
        API_ERROR_CODES.VALIDATION_ERROR,
        "Invalid payment payload.",
        400,
        { requestId, details: error.flatten() },
      );
    }

    if (error instanceof PaymentExceedsBalanceError) {
      return jsonError(API_ERROR_CODES.VALIDATION_ERROR, error.message, 400, {
        requestId,
      });
    }

    if (error instanceof IdempotencyConflictError) {
      return jsonError(API_ERROR_CODES.CONFLICT, error.message, 409, { requestId });
    }

    return jsonError(
      API_ERROR_CODES.INTERNAL_ERROR,
      toSafeErrorMessage("Unable to create payment entry.", error),
      500,
      { requestId },
    );
  }
};
