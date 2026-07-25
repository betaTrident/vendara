import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, test } from "vitest";

describe("overview page contracts", () => {
  test("uses real navigation destinations and honest empty states", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/components/app/pages/OverviewPage.tsx"),
      "utf8",
    );

    expect(source).toContain('onNavigate("/admin/products")');
    expect(source).toContain('onNavigate("/admin/customers")');
    expect(source).toContain('onNavigate("/admin/transactions/purchase")');
    expect(source).toContain('onNavigate("/admin/transactions/payment")');
    expect(source).toContain("No recent ledger, price, or customer activity yet.");
    expect(source).toContain("All customer accounts are settled.");
    expect(source).not.toMatch(/Aling Nena|Juan Dela Cruz|₱28,640/);
  });

  test("summary repository derives activity and aging without client N+1 loops", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/lib/server/summary-repository.ts"),
      "utf8",
    );

    expect(source).toContain("recentActivity");
    expect(source).toContain("agingBuckets");
    expect(source).toContain("topBalances");
    expect(source).toContain("classifyAgingBucket");
    expect(source).not.toContain("for (const customer of");
  });
});
