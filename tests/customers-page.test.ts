import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, test } from "vitest";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("customers page contracts", () => {
  test("CustomersPage is URL-backed with metrics, filters, and no phone/address fields", () => {
    const page = read("src/components/app/pages/CustomersPage.tsx");
    const metrics = read("src/components/app/customers/CustomerMetrics.tsx");
    const form = read("src/components/app/customers/CustomerFormPanel.tsx");
    const dialog = read("src/components/app/customers/DeleteCustomerDialog.tsx");

    expect(page).toContain('title="Customers"');
    expect(page).toContain("PageHeader");
    expect(page).toContain("customer-ledger");
    expect(page).toContain("CustomerMetrics");
    expect(page).toContain("CustomerFilters");
    expect(page).toContain("DeleteCustomerDialog");
    expect(metrics).toContain("Total Customers");
    expect(metrics).toContain("Unpaid");
    expect(metrics).toContain("Fully Paid");
    expect(metrics).toContain("Highest Outstanding");
    expect(form).toContain("customer-name");
    expect(form).toContain("customer-note");
    expect(form).not.toMatch(/\bphone\b|\baddress\b|\bbarangay\b/i);
    expect(dialog).toContain("AlertDialog");
  });

  test("AdminConsole wires Customers and dedicated ledger pages", () => {
    const source = read("src/components/app/AdminConsole.tsx");

    expect(source).toContain("CustomersPage");
    expect(source).toContain("CustomerLedgerPage");
    expect(source).not.toContain("CustomerManager");
    expect(source).not.toContain("CustomerLedgerPanel");
    expect(source).toMatch(
      /case "customer-ledger":\s*return \(\s*<CustomerLedgerPage/,
    );
  });
});

describe("customer ledger page contracts", () => {
  test("ledger page provides chart text equivalent, void controls, and transaction navigation", () => {
    const page = read("src/components/app/pages/CustomerLedgerPage.tsx");
    const chart = read("src/components/app/ledger/BalanceChart.tsx");
    const table = read("src/components/app/ledger/LedgerTable.tsx");

    expect(page).toContain("Back to Customers");
    expect(page).toContain("LedgerMetrics");
    expect(page).toContain("BalanceChart");
    expect(page).toContain("Record Purchase");
    expect(page).toContain("Record Payment");
    expect(page).toContain('name: "record-purchase"');
    expect(page).toContain('name: "record-payment"');
    expect(chart).toContain("sr-only");
    expect(chart).toContain("balance-chart-summary");
    expect(table).toContain("Confirm void");
    expect(page).not.toContain("LedgerTransactionForms");
    expect(page).not.toMatch(/\bphone\b|\baddress\b|\bbarangay\b/i);
  });

  test("customer GET endpoint remains owner-protected", () => {
    const api = read("src/pages/api/customers/[id].ts");

    expect(api).toContain("requireOwner");
    expect(api).toContain("parseRouteUuid");
    expect(api).toContain("getCustomerById");
  });
});
