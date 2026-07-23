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
  createDebtEntryWithItems,
  getProductsByIds,
  IdempotencyConflictError,
} from "@/lib/server/ledger-repository";
import { ledgerDebtSchema, parseRouteUuid } from "@/lib/validation";

const customerLedgerService = createCustomerLedgerService({
  getProductsByIds,
  createDebtWithItems: createDebtEntryWithItems,
  createPaymentEntry: async () => ({ id: "" }),
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
    const data = ledgerDebtSchema.parse(await request.json());
    const result = await customerLedgerService.createDebt({
      customerId: customerId.value,
      entryDate: data.entryDate,
      note: data.note ?? null,
      idempotencyKey: idempotencyKey.value,
      items: data.items,
    });

    return jsonOk(result, { status: 201, requestId });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError(
        API_ERROR_CODES.VALIDATION_ERROR,
        "Invalid debt payload.",
        400,
        { requestId, details: error.flatten() },
      );
    }

    if (error instanceof IdempotencyConflictError) {
      return jsonError(API_ERROR_CODES.CONFLICT, error.message, 409, { requestId });
    }

    if (error instanceof Error && error.message.startsWith("Product not found:")) {
      return jsonError(
        API_ERROR_CODES.VALIDATION_ERROR,
        "One or more products are unavailable.",
        400,
        { requestId },
      );
    }

    return jsonError(
      API_ERROR_CODES.INTERNAL_ERROR,
      toSafeErrorMessage("Unable to create debt entry.", error),
      500,
      { requestId },
    );
  }
};
