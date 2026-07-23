import type { APIRoute } from "astro";
import { ZodError } from "zod";

import {
  API_ERROR_CODES,
  jsonError,
  jsonOk,
  resolveRequestId,
  toSafeErrorMessage,
} from "@/lib/api";
import { requireOwnerMutation } from "@/lib/auth/admin";
import {
  getLedgerEntryById,
  LedgerEntryAlreadyVoidedError,
  voidLedgerEntry,
} from "@/lib/server/ledger-repository";
import { ledgerVoidSchema, parseRouteUuid } from "@/lib/validation";

export const POST: APIRoute = async ({ params, request }) => {
  const owner = await requireOwnerMutation(request);
  const requestId = resolveRequestId(request);

  if (owner instanceof Response) {
    return owner;
  }

  const entryId = parseRouteUuid(params.entryId);

  if (!entryId.ok) {
    return jsonError(
      API_ERROR_CODES.VALIDATION_ERROR,
      "Ledger entry ID must be a valid UUID.",
      400,
      { requestId },
    );
  }

  try {
    const data = ledgerVoidSchema.parse(await request.json());
    const existing = await getLedgerEntryById(entryId.value);

    if (!existing) {
      return jsonError(
        API_ERROR_CODES.NOT_FOUND,
        "Ledger entry not found.",
        404,
        { requestId },
      );
    }

    const result = await voidLedgerEntry({
      entryId: entryId.value,
      voidedBy: owner.email,
      reason: data.reason,
    });

    if (!result) {
      return jsonError(
        API_ERROR_CODES.NOT_FOUND,
        "Ledger entry not found.",
        404,
        { requestId },
      );
    }

    return jsonOk(
      {
        entryId: entryId.value,
        customerId: result.customerId,
        balance: result.balance,
      },
      { requestId },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError(
        API_ERROR_CODES.VALIDATION_ERROR,
        "Invalid void payload.",
        400,
        { requestId, details: error.flatten() },
      );
    }

    if (error instanceof LedgerEntryAlreadyVoidedError) {
      return jsonError(API_ERROR_CODES.CONFLICT, error.message, 409, { requestId });
    }

    return jsonError(
      API_ERROR_CODES.INTERNAL_ERROR,
      toSafeErrorMessage("Unable to void ledger entry.", error),
      500,
      { requestId },
    );
  }
};
