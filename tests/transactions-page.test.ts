import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, test } from "vitest";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("record purchase page contracts", () => {
  test("RecordPurchasePage provides customer picker, line editor, balance preview, and idempotent submit", () => {
    const page = read("src/components/app/pages/RecordPurchasePage.tsx");
    const summary = read(
      "src/components/app/transactions/PurchaseSummaryPanel.tsx",
    );
    const editor = read("src/components/app/transactions/ProductLineEditor.tsx");

    expect(page).toContain('title="Record credit purchase"');
    expect(page).toContain("CustomerPicker");
    expect(page).toContain("ProductLineEditor");
    expect(page).toContain("PurchaseSummaryPanel");
    expect(page).toContain("post-debt-btn");
    expect(page).toContain("idempotencyKey");
    expect(page).toContain("isOnline");
    expect(page).toContain("/api/customers/");
    expect(page).toContain("/ledger/debt");
    expect(summary).toContain("Balance effect");
    expect(summary).toContain("New outstanding balance");
    expect(editor).toContain("not available in this release");
    expect(page).not.toMatch(/\bdiscount\b/i);
  });
});

describe("record payment page contracts", () => {
  test("RecordPaymentPage provides balance preview, overpayment guard, recent payments, and idempotent submit", () => {
    const page = read("src/components/app/pages/RecordPaymentPage.tsx");
    const summary = read(
      "src/components/app/transactions/PaymentSummaryPanel.tsx",
    );
    const recent = read(
      "src/components/app/transactions/RecentPaymentsPanel.tsx",
    );

    expect(page).toContain('title="Record payment"');
    expect(page).toContain("CustomerPicker");
    expect(page).toContain("PaymentSummaryPanel");
    expect(page).toContain("RecentPaymentsPanel");
    expect(page).toContain("post-payment-btn");
    expect(page).toContain("idempotencyKey");
    expect(page).toContain("isOnline");
    expect(page).toContain("/ledger/payment");
    expect(summary).toContain("New balance after payment");
    expect(summary).toContain("exceeds the outstanding balance");
    expect(summary).toContain("Payment method tracking is not available");
    expect(recent).toContain("Recent payments");
    expect(page).not.toMatch(/\bpaymentMethod\b|\bcash\b|\bgcash\b/i);
  });
});

describe("admin transaction routing", () => {
  test("AdminConsole wires dedicated purchase and payment pages", () => {
    const source = read("src/components/app/AdminConsole.tsx");

    expect(source).toContain("RecordPurchasePage");
    expect(source).toContain("RecordPaymentPage");
    expect(source).not.toContain("RoutePlaceholderPage");
    expect(source).toMatch(
      /case "record-purchase":\s*return \(\s*<RecordPurchasePage/,
    );
    expect(source).toMatch(
      /case "record-payment":\s*return \(\s*<RecordPaymentPage/,
    );
  });

  test("customer surfaces deep-link to dedicated transaction routes", () => {
    const customers = read("src/components/app/pages/CustomersPage.tsx");
    const ledger = read("src/components/app/pages/CustomerLedgerPage.tsx");

    expect(customers).toContain('name: "record-purchase"');
    expect(customers).toContain('name: "record-payment"');
    expect(ledger).toContain('name: "record-purchase"');
    expect(ledger).toContain('name: "record-payment"');
    expect(ledger).not.toContain("LedgerTransactionForms");
  });
});
