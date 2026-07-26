import { describe, expect, it } from "vitest";

import {
  DEFAULT_CUSTOMER_PAGE_SIZE,
  filterCustomers,
  summarizeCustomerDirectory,
} from "@/lib/domain/customers";
import {
  buildBalanceTrendSeries,
  filterLedgerEntries,
  summarizeLedgerView,
} from "@/lib/domain/ledger";

describe("customer directory domain", () => {
  const customers = [
    {
      id: "c-1",
      name: "Aling Nena",
      note: "Corner stall",
      balance: 120,
      updatedAt: "2026-06-01T00:00:00.000Z",
    },
    {
      id: "c-2",
      name: "Mang Ben",
      note: null,
      balance: 0,
      updatedAt: "2026-06-02T00:00:00.000Z",
    },
    {
      id: "c-3",
      name: "Tita Rosa",
      note: null,
      balance: 450,
      updatedAt: "2026-06-03T00:00:00.000Z",
    },
  ];

  it("summarizes totals, unpaid, fully paid, and highest outstanding", () => {
    expect(summarizeCustomerDirectory(customers)).toEqual({
      total: 3,
      unpaid: 2,
      fullyPaid: 1,
      totalOutstanding: 570,
      highestOutstanding: {
        customerId: "c-3",
        name: "Tita Rosa",
        balance: 450,
      },
    });
  });

  it("filters by search and balance status", () => {
    expect(
      filterCustomers(customers, { search: "rosa", balanceFilter: "all" }),
    ).toHaveLength(1);
    expect(
      filterCustomers(customers, { balanceFilter: "unpaid" }).map((c) => c.id),
    ).toEqual(["c-1", "c-3"]);
    expect(
      filterCustomers(customers, { balanceFilter: "paid" }).map((c) => c.id),
    ).toEqual(["c-2"]);
  });

  it("exposes a stable customer page size default", () => {
    expect(DEFAULT_CUSTOMER_PAGE_SIZE).toBeGreaterThan(0);
  });
});

describe("ledger view domain", () => {
  const entries = [
    {
      id: "e-1",
      entryType: "debt" as const,
      entryDate: "2026-06-01",
      totalAmount: 100,
      paymentAmount: null,
      voidedAt: null,
      runningBalance: 100,
    },
    {
      id: "e-2",
      entryType: "payment" as const,
      entryDate: "2026-06-02",
      totalAmount: null,
      paymentAmount: 40,
      voidedAt: null,
      runningBalance: 60,
    },
    {
      id: "e-3",
      entryType: "debt" as const,
      entryDate: "2026-06-03",
      totalAmount: 25,
      paymentAmount: null,
      voidedAt: "2026-06-04T00:00:00.000Z",
      runningBalance: 60,
    },
  ];

  it("summarizes purchases, payments, and last activity excluding voided totals", () => {
    expect(summarizeLedgerView(entries)).toEqual({
      totalPurchases: 100,
      totalPayments: 40,
      lastActivity: "2026-06-02",
      currentBalance: 60,
    });
  });

  it("filters ledger rows by type and date range", () => {
    expect(
      filterLedgerEntries(entries, {
        entryType: "payment",
        fromDate: "2026-06-02",
        toDate: "2026-06-02",
      }),
    ).toHaveLength(1);
    expect(
      filterLedgerEntries(entries, { entryType: "debt" }),
    ).toHaveLength(2);
  });

  it("builds chronological balance trend points from active entries", () => {
    expect(buildBalanceTrendSeries(entries)).toEqual([
      { at: "2026-06-01", balance: 100 },
      { at: "2026-06-02", balance: 60 },
    ]);
  });
});
