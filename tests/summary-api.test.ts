import { describe, expect, it } from "vitest";

import type { OwnerSummary } from "@/lib/types";

describe("summary API contract", () => {
  it("defines the compact owner overview fields", () => {
    const sample: OwnerSummary = {
      activeProductCount: 12,
      customerCount: 8,
      customersWithBalanceCount: 3,
      totalOutstanding: 150.5,
    };

    expect(sample.activeProductCount).toBeGreaterThanOrEqual(0);
    expect(sample.customersWithBalanceCount).toBeLessThanOrEqual(sample.customerCount);
    expect(sample.totalOutstanding).toBeGreaterThanOrEqual(0);
  });
});
