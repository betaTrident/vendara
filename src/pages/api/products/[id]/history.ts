import type { APIRoute } from "astro";

import {
  API_ERROR_CODES,
  jsonError,
  jsonOk,
  resolveRequestId,
} from "@/lib/api";
import { requireOwner } from "@/lib/auth/admin";
import {
  parseHistoryPagination,
  parsePriceHistoryRange,
  type PriceHistoryRange,
} from "@/lib/domain/pricing";
import { listPriceHistory } from "@/lib/server/products-repository";
import { parseRouteUuid } from "@/lib/validation";

const rangeToSince = (range: PriceHistoryRange, now = new Date()): Date | null => {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  switch (range) {
    case "7d":
      return new Date(now.getTime() - 7 * MS_PER_DAY);
    case "30d":
      return new Date(now.getTime() - 30 * MS_PER_DAY);
    case "90d":
      return new Date(now.getTime() - 90 * MS_PER_DAY);
    case "all":
      return null;
    default: {
      const _exhaustive: never = range;
      return _exhaustive;
    }
  }
};

export const GET: APIRoute = async ({ params, request, url }) => {
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

  const range = parsePriceHistoryRange(url.searchParams.get("range"));
  if (!range) {
    return jsonError(
      API_ERROR_CODES.VALIDATION_ERROR,
      "Range must be one of 7d, 30d, 90d, or all.",
      400,
      { requestId },
    );
  }

  const pagination = parseHistoryPagination({
    limit: url.searchParams.get("limit"),
    offset: url.searchParams.get("offset"),
  });

  if (!pagination.ok) {
    return jsonError(
      API_ERROR_CODES.VALIDATION_ERROR,
      pagination.message,
      400,
      { requestId },
    );
  }

  const history = await listPriceHistory(productId.value, {
    since: rangeToSince(range),
    limit: pagination.limit,
    offset: pagination.offset,
  });

  return jsonOk(history, { requestId });
};
