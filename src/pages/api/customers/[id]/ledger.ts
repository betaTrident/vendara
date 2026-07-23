import type { APIRoute } from "astro";

import {
  API_ERROR_CODES,
  jsonError,
  jsonOk,
  resolveRequestId,
} from "@/lib/api";
import { requireOwner } from "@/lib/auth/admin";
import { listCustomerLedger } from "@/lib/server/ledger-repository";
import { parseRouteUuid } from "@/lib/validation";

export const GET: APIRoute = async ({ params, request }) => {
  const owner = await requireOwner(request);
  const requestId = resolveRequestId(request);

  if (owner instanceof Response) {
    return owner;
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

  const includeVoided = new URL(request.url).searchParams.get("includeVoided") === "1";

  return jsonOk(
    await listCustomerLedger(customerId.value, { includeVoided }),
    { requestId },
  );
};
