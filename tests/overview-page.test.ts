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

  test("gives every KPI card a real navigation destination", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/components/app/pages/OverviewPage.tsx"),
      "utf8",
    );
    const kpiCards = [...source.matchAll(/<StatCard\b[\s\S]*?\/>/g)].map(([card]) => card);

    expect(kpiCards).toHaveLength(3);
    expect(kpiCards).toEqual(
      expect.arrayContaining([
        expect.stringMatching(
          /label="Active products"[\s\S]*onClick=\{\(\) => onNavigate\("\/admin\/products"\)\}/,
        ),
        expect.stringMatching(
          /label="Customers with unpaid balances"[\s\S]*onClick=\{\(\) => onNavigate\("\/admin\/customers"\)\}/,
        ),
        expect.stringMatching(
          /label="Total outstanding amount"[\s\S]*onClick=\{\(\) => onNavigate\("\/admin\/customers"\)\}/,
        ),
      ]),
    );
    expect(source).toMatch(
      /function StatCard\([\s\S]*onClick[\s\S]*<button[\s\S]*onClick=\{onClick\}/,
    );
  });

  test("does not ship reference screenshot fixtures or invented KPI trend claims", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/components/app/pages/OverviewPage.tsx"),
      "utf8",
    );

    expect(source).not.toMatch(
      /Aling Nena|Juan Dela Cruz|Puregold Jr\.|Maria Santos|Ana Reyes|Pedro Garcia|Liza Mendoza|Bear Brand 33g/,
    );
    expect(source).not.toMatch(
      /248|28,?640(?:\.75)?|\+12 this month|\+5 this week|\+₱?3,?925\.50 this week/i,
    );
    expect(source).not.toMatch(/w-\[\d+%\]/);
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
