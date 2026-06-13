import type { APIRoute } from "astro";

import { jsonError } from "@/lib/api";

export const POST: APIRoute = async () =>
  jsonError("Use Neon Auth from the client application.", 410);
