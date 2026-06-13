import { defineMiddleware } from "astro:middleware";

import { buildSecurityHeaders } from "@/lib/security/headers";

export const onRequest = defineMiddleware(async (_, next) => {
  const response = await next();
  const securityHeaders = buildSecurityHeaders();

  Object.entries(securityHeaders).forEach(([name, value]) => {
    response.headers.set(name, value);
  });

  return response;
});
