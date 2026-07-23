import { getServerEnv } from "@/lib/env.server";

export const buildSecurityHeaders = () => {
  const neonAuthOrigin = new URL(getServerEnv().publicNeonAuthUrl).origin;
  const isProduction = import.meta.env.PROD;

  const headers: Record<string, string> = {
    "content-security-policy": [
      "default-src 'self'",
      `connect-src 'self' ${neonAuthOrigin}`,
      "img-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline'",
      "font-src 'self' data:",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
    "x-frame-options": "DENY",
    "x-content-type-options": "nosniff",
    "referrer-policy": "strict-origin-when-cross-origin",
    "permissions-policy": "camera=(), microphone=(), geolocation=()",
  };

  if (isProduction) {
    headers["strict-transport-security"] = "max-age=63072000; includeSubDomains; preload";
  }

  return headers;
};
