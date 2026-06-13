import { describe, expect, it } from "vitest";

import { isVerifiedEmailClaim, shouldAuthorizeAdmin } from "@/lib/auth/admin";

describe("admin authorization guards", () => {
  it("accepts explicit verified-email claims", () => {
    expect(isVerifiedEmailClaim(true)).toBe(true);
    expect(isVerifiedEmailClaim("true")).toBe(true);
    expect(isVerifiedEmailClaim("TRUE")).toBe(true);
  });

  it("rejects missing or false verified-email claims", () => {
    expect(isVerifiedEmailClaim(false)).toBe(false);
    expect(isVerifiedEmailClaim("false")).toBe(false);
    expect(isVerifiedEmailClaim(undefined)).toBe(false);
    expect(isVerifiedEmailClaim(null)).toBe(false);
  });

  it("only authorizes admins with verified emails and a subject", () => {
    expect(
      shouldAuthorizeAdmin({
        email: "admin@example.com",
        sub: "user_123",
        emailVerified: true,
      }),
    ).toEqual({
      email: "admin@example.com",
      userId: "user_123",
    });

    expect(
      shouldAuthorizeAdmin({
        email: "admin@example.com",
        sub: "user_123",
        email_verified: true,
      }),
    ).toEqual({
      email: "admin@example.com",
      userId: "user_123",
    });

    expect(
      shouldAuthorizeAdmin({
        email: "admin@example.com",
        sub: "user_123",
      }),
    ).toBeNull();

    expect(
      shouldAuthorizeAdmin({
        email: "admin@example.com",
        sub: "user_123",
        emailVerified: false,
      }),
    ).toBeNull();
  });
});
