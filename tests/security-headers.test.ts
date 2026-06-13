import { describe, expect, it } from "vitest";

import { buildSecurityHeaders } from "@/lib/security/headers";

describe("security headers", () => {
  it("returns anti-framing headers for app pages", () => {
    const headers = buildSecurityHeaders();

    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  });
});
