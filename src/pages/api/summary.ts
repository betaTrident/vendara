import type { APIRoute } from "astro";

import { jsonOk, resolveRequestId } from "@/lib/api";
import { requireOwner } from "@/lib/auth/admin";
import { getOwnerSummary } from "@/lib/server/summary-repository";

export const GET: APIRoute = async ({ request }) => {
  const owner = await requireOwner(request);
  const requestId = resolveRequestId(request);

  if (owner instanceof Response) {
    return owner;
  }

  return jsonOk(await getOwnerSummary(), { requestId });
};
