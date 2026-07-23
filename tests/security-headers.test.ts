import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env.server", () => ({
  getServerEnv: () => ({
    publicNeonAuthUrl: "https://auth.example.com",
    databaseUrl: "postgresql://user:pass@localhost/db",
  }),
}));

import { buildSecurityHeaders } from "@/lib/security/headers";

describe("security headers", () => {
  it("returns anti-framing and hardening headers for app pages", () => {
    const headers = buildSecurityHeaders();

    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["content-security-policy"]).toContain("https://auth.example.com");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toContain("camera=()");
  });
});
