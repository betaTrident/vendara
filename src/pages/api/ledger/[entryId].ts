import type { APIRoute } from "astro";

import {
  API_ERROR_CODES,
  jsonError,
  resolveRequestId,
} from "@/lib/api";

const ledgerMutationNotAllowed = (request: Request) =>
  jsonError(
    API_ERROR_CODES.METHOD_NOT_ALLOWED,
    "Ledger entries cannot be edited or deleted. Use void-and-repost after that workflow is available.",
    405,
    {
      requestId: resolveRequestId(request),
      headers: {
        Allow: "GET, HEAD",
      },
    },
  );

export const PUT: APIRoute = async ({ request }) => ledgerMutationNotAllowed(request);

export const DELETE: APIRoute = async ({ request }) =>
  ledgerMutationNotAllowed(request);
