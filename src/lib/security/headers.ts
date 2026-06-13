export const buildSecurityHeaders = () => ({
  "content-security-policy": "frame-ancestors 'none'",
  "x-frame-options": "DENY",
});
