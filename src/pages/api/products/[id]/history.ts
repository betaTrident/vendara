import type { APIRoute } from "astro";

import { jsonError, jsonOk } from "@/lib/api";
import { requireAdmin } from "@/lib/auth/admin";
import { listPriceHistory } from "@/lib/server/products-repository";

export const GET: APIRoute = async ({ params, request }) => {
  const admin = await requireAdmin(request);

  if (admin instanceof Response) {
    return admin;
  }

  if (!params.id) {
    return jsonError("Missing product ID.");
  }

  return jsonOk(await listPriceHistory(params.id));
};
