import { describe, expect, it } from "vitest";

import type { OwnerSummary } from "@/lib/types";
import { PRIVATE_RESPONSE_CACHE_HEADERS } from "@/lib/api";

describe("summary API contract", () => {
  it("defines compact metrics plus derived overview aggregates", () => {
    const sample: OwnerSummary = {
      activeProductCount: 12,
      customerCount: 8,
      customersWithBalanceCount: 3,
      totalOutstanding: 150.5,
      recentActivity: [
        {
          id: "a1",
          kind: "payment",
          title: "Payment recorded",
          detail: "Customer A · ₱50.00",
          occurredAt: "2026-07-25T01:00:00.000Z",
        },
      ],
      topBalances: [
        {
          customerId: "22222222-2222-4222-8222-222222222222",
          customerName: "Customer A",
          balance: 100,
        },
      ],
      agingBuckets: [
        { id: "current", label: "Current", customerCount: 1 },
        { id: "late-1-7", label: "1–7 days late", customerCount: 1 },
        { id: "late-8-30", label: "8–30 days late", customerCount: 1 },
        { id: "late-30-plus", label: "Over 30 days", customerCount: 0 },
      ],
    };

    expect(sample.activeProductCount).toBeGreaterThanOrEqual(0);
    expect(sample.customersWithBalanceCount).toBeLessThanOrEqual(
      sample.customerCount,
    );
    expect(sample.totalOutstanding).toBeGreaterThanOrEqual(0);
    expect(sample.recentActivity).toHaveLength(1);
    expect(sample.topBalances[0]?.balance).toBeGreaterThan(0);
    expect(sample.agingBuckets).toHaveLength(4);
  });

  it("keeps private no-store cache headers for owner summary responses", () => {
    expect(PRIVATE_RESPONSE_CACHE_HEADERS["Cache-Control"]).toBe("no-store");
  });
});
