import type { APIRoute } from "astro";

import { REQUEST_ID_HEADER, resolveRequestId } from "@/lib/api";

export const GET: APIRoute = async ({ request }) => {
  const requestId = resolveRequestId(request);
  const status = "ok" as const;

  return new Response(
    JSON.stringify({
      status,
      timestamp: new Date().toISOString(),
      requestId,
    }),
    {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "cache-control": "no-store",
        [REQUEST_ID_HEADER]: requestId,
      },
    },
  );
};
