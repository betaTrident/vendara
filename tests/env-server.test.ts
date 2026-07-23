import { describe, expect, it } from "vitest";

import { getDeploymentLabel, getServerEnv } from "@/lib/env.server";

describe("server environment", () => {
  it("reads required variables when present", () => {
    const originalDatabase = process.env.DATABASE_URL;
    const originalAuth = process.env.PUBLIC_NEON_AUTH_URL;

    process.env.DATABASE_URL = "postgres://example";
    process.env.PUBLIC_NEON_AUTH_URL = "https://auth.example";

    expect(getServerEnv()).toEqual({
      databaseUrl: "postgres://example",
      publicNeonAuthUrl: "https://auth.example",
    });

    process.env.DATABASE_URL = originalDatabase;
    process.env.PUBLIC_NEON_AUTH_URL = originalAuth;
  });

  it("returns a short deployment label without secrets", () => {
    const label = getDeploymentLabel();
    expect(label).toEqual(expect.any(String));
    expect(label).not.toMatch(/postgres/i);
  });

  it("throws when required environment variables are missing", () => {
    const originalDatabase = process.env.DATABASE_URL;
    const originalAuth = process.env.PUBLIC_NEON_AUTH_URL;

    delete process.env.DATABASE_URL;
    delete process.env.PUBLIC_NEON_AUTH_URL;

    expect(() => getServerEnv()).toThrow(/DATABASE_URL/);

    process.env.DATABASE_URL = originalDatabase;
    process.env.PUBLIC_NEON_AUTH_URL = originalAuth;
  });
});
