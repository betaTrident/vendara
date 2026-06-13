import { describe, expect, it } from "vitest";

import {
  getBearerTokenFromHeaders,
  hasTrustedOrigin,
  normalizeAdminEmail,
} from "@/lib/auth/http";

describe("admin auth HTTP helpers", () => {
  it("extracts a bearer token from the authorization header", () => {
    const headers = new Headers({
      authorization: "Bearer test-token",
    });

    expect(getBearerTokenFromHeaders(headers)).toBe("test-token");
  });

  it("rejects malformed authorization headers", () => {
    const headers = new Headers({
      authorization: "Basic abc123",
    });

    expect(getBearerTokenFromHeaders(headers)).toBeNull();
  });

  it("accepts requests with the same origin and host", () => {
    const headers = new Headers({
      host: "vendara.example",
      origin: "https://vendara.example",
    });

    expect(hasTrustedOrigin(headers)).toBe(true);
  });

  it("rejects requests with a mismatched origin", () => {
    const headers = new Headers({
      host: "vendara.example",
      origin: "https://evil.example",
    });

    expect(hasTrustedOrigin(headers)).toBe(false);
  });

  it("normalizes admin emails for allowlist checks", () => {
    expect(normalizeAdminEmail("  ColinAkb24@GMAIL.com ")).toBe(
      "colinakb24@gmail.com",
    );
  });
});
