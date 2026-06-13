import type { APIRoute } from "astro";

import { jsonOk } from "@/lib/api";
import { getAuthenticatedAdmin } from "@/lib/auth/admin";

export const GET: APIRoute = async ({ request }) => {
  const admin = await getAuthenticatedAdmin(request);

  return jsonOk({
    authenticated: Boolean(admin),
    email: admin?.email ?? null,
  });
};
