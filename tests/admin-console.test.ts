import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

describe("admin console workspace", () => {
  it("defaults to the customers work area and loads summary from one endpoint", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/components/app/AdminConsole.tsx"),
      "utf8",
    );

    expect(source).toContain('defaultValue="customers"');
    expect(source).toContain('fetchAdminJson<OwnerSummary>("/api/summary")');
    expect(source).not.toContain('fetchAdminJson<Product[]>("/api/products")');
  });
});
