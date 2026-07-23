import { createRemoteJWKSet, jwtVerify } from "jose";

import {
  API_ERROR_CODES,
  jsonError,
  resolveRequestId,
} from "@/lib/api";
import { getServerEnv } from "@/lib/env.server";
import { getBearerTokenFromHeaders, hasTrustedOrigin, normalizeAdminEmail } from "@/lib/auth/http";
import { getActiveAdminUserByEmail } from "@/lib/server/admin-users-repository";

type NeonAdminTokenPayload = {
  sub?: string;
  email?: string;
  emailVerified?: boolean | string | null;
  email_verified?: boolean | string | null;
};

export type AuthenticatedAdmin = {
  email: string;
  userId: string;
};

let cachedJwksUrl = "";
let cachedJwks:
  | ReturnType<typeof createRemoteJWKSet>
  | null = null;

export const isVerifiedEmailClaim = (value: NeonAdminTokenPayload["email_verified"]) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }

  return false;
};

export const shouldAuthorizeAdmin = (payload: NeonAdminTokenPayload) => {
  const email = typeof payload.email === "string" ? normalizeAdminEmail(payload.email) : "";
  const userId = typeof payload.sub === "string" ? payload.sub : "";
  const isVerified = isVerifiedEmailClaim(
    payload.emailVerified ?? payload.email_verified,
  );

  if (!email || !userId || !isVerified) {
    return null;
  }

  return {
    email,
    userId,
  };
};

const getNeonJwks = () => {
  const jwksUrl = `${getServerEnv().publicNeonAuthUrl}/.well-known/jwks.json`;

  if (!cachedJwks || cachedJwksUrl !== jwksUrl) {
    cachedJwksUrl = jwksUrl;
    cachedJwks = createRemoteJWKSet(new URL(jwksUrl));
  }

  return cachedJwks;
};

const verifyNeonToken = async (token: string) => {
  const issuer = new URL(getServerEnv().publicNeonAuthUrl).origin;
  const { payload } = await jwtVerify(token, getNeonJwks(), {
    issuer,
  });

  return payload as NeonAdminTokenPayload;
};

export const getAuthenticatedAdmin = async (
  request: Request,
): Promise<AuthenticatedAdmin | null> => {
  const token = getBearerTokenFromHeaders(request.headers);

  if (!token) {
    return null;
  }

  try {
    const payload = await verifyNeonToken(token);
    const adminCandidate = shouldAuthorizeAdmin(payload);

    if (!adminCandidate) {
      return null;
    }

    const adminUser = await getActiveAdminUserByEmail(adminCandidate.email);

    if (!adminUser) {
      return null;
    }

    return {
      email: adminUser.email,
      userId: adminCandidate.userId,
    };
  } catch {
    return null;
  }
};

/** Read-only business routes: verified active owner, no origin check. */
export const requireOwner = async (request: Request) => {
  const requestId = resolveRequestId(request);
  const admin = await getAuthenticatedAdmin(request);

  if (!admin) {
    return jsonError(
      API_ERROR_CODES.UNAUTHENTICATED,
      "Unauthorized.",
      401,
      { requestId },
    );
  }

  return admin;
};

/** State-changing business routes: verified active owner plus trusted origin. */
export const requireOwnerMutation = async (request: Request) => {
  const requestId = resolveRequestId(request);

  if (!hasTrustedOrigin(request.headers)) {
    return jsonError(
      API_ERROR_CODES.FORBIDDEN,
      "Invalid origin.",
      403,
      { requestId },
    );
  }

  return requireOwner(request);
};

/** @deprecated Use requireOwner */
export const requireAdmin = requireOwner;

/** @deprecated Use requireOwnerMutation */
export const requireTrustedAdmin = requireOwnerMutation;
