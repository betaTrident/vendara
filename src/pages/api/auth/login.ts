import type { APIRoute } from "astro";

import { API_ERROR_CODES, jsonError } from "@/lib/api";

export const POST: APIRoute = async () =>
  jsonError(
    API_ERROR_CODES.CONFLICT,
    "Use Neon Auth from the client application.",
    410,
  );
