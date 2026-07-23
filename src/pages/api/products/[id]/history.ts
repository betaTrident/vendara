import type { APIRoute } from "astro";

import {
  API_ERROR_CODES,
  jsonError,
  jsonOk,
  resolveRequestId,
} from "@/lib/api";
import { requireOwner } from "@/lib/auth/admin";
import { listPriceHistory } from "@/lib/server/products-repository";
import { parseRouteUuid } from "@/lib/validation";

export const GET: APIRoute = async ({ params, request }) => {
  const owner = await requireOwner(request);
  const requestId = resolveRequestId(request);

  if (owner instanceof Response) {
    return owner;
  }

  const productId = parseRouteUuid(params.id);

  if (!productId.ok) {
    return jsonError(
      API_ERROR_CODES.VALIDATION_ERROR,
      "Product ID must be a valid UUID.",
      400,
      { requestId },
    );
  }

  return jsonOk(await listPriceHistory(productId.value), { requestId });
};
