import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, test } from "vitest";

describe("admin login privacy and honesty", () => {
  test("does not ship dead remember-me or forgot-password controls", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/components/app/AdminLogin.tsx"),
      "utf8",
    );

    expect(source).not.toMatch(/remember me/i);
    expect(source).not.toMatch(/forgot password/i);
    expect(source).toMatch(/show password/i);
    expect(source).toContain("VendaraLogo");
    expect(source).toContain('role="alert"');
  });

  test("admin console never loads summary before authentication", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/components/app/AdminConsole.tsx"),
      "utf8",
    );

    expect(source).toContain("if (isAuthenticated)");
    expect(source).toContain('fetchAdminJson<OwnerSummary>("/api/summary")');
    expect(source).toContain("AdminLogin");
    // Summary fetch is gated; login branch has no summary render.
    expect(source).toMatch(
      /if \(!isAuthenticated\)[\s\S]*AdminLogin[\s\S]*return/,
    );
  });
});
