export const normalizeAdminEmail = (value: string) => value.trim().toLowerCase();

export const getBearerTokenFromHeaders = (headers: Headers) => {
  const authorization = headers.get("authorization");

  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(/\s+/, 2);

  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
};

export const hasTrustedOrigin = (headers: Headers) => {
  const origin = headers.get("origin");
  const host = headers.get("host");

  if (!origin || !host) {
    return true;
  }

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
};
