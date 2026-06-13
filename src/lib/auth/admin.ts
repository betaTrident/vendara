import { createRemoteJWKSet, jwtVerify } from "jose";

import { jsonError } from "@/lib/api";
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

export const requireAdmin = async (request: Request) => {
  const admin = await getAuthenticatedAdmin(request);

  if (!admin) {
    return jsonError("Unauthorized.", 401);
  }

  return admin;
};

export const requireTrustedAdmin = async (request: Request) => {
  if (!hasTrustedOrigin(request.headers)) {
    return jsonError("Invalid origin.", 403);
  }

  return requireAdmin(request);
};
