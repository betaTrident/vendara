import { defineMiddleware } from "astro:middleware";

import { REQUEST_ID_HEADER, resolveRequestId } from "@/lib/api";
import { buildSecurityHeaders } from "@/lib/security/headers";

export const onRequest = defineMiddleware(async (context, next) => {
  const requestId = resolveRequestId(context.request);
  const response = await next();
  const securityHeaders = buildSecurityHeaders();

  response.headers.set(REQUEST_ID_HEADER, requestId);

  Object.entries(securityHeaders).forEach(([name, value]) => {
    response.headers.set(name, value);
  });

  return response;
});
