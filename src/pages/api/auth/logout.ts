import type { APIRoute } from "astro";

import { jsonOk } from "@/lib/api";

export const POST: APIRoute = async () =>
  jsonOk({
    authenticated: false,
  });
