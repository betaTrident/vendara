import { existsSync, readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { resolvePostAuthPath } from "@/lib/admin/routes";
import {
  PRECACHE_EXCLUDE_PATTERNS,
  shouldExcludeFromPrecache,
} from "@/lib/pwa/cache-policy";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

const packageJson = JSON.parse(read("package.json")) as {
  scripts: Record<string, string>;
};

const REQUIRED_GATES = [
  "typecheck",
  "test",
  "test:integration",
  "coverage",
  "build",
  "test:e2e",
] as const;

const REFERENCE_PAGES = [
  { reference: "landing-page.png", route: "/", evidence: "phase-4" },
  { reference: "login-page.png", route: "/admin", evidence: "phase-9" },
  { reference: "dashboard.png", route: "/admin/overview", evidence: "phase-9" },
  { reference: "products.png", route: "/admin/products", evidence: "phase-5" },
  {
    reference: "price-history.png",
    route: "/admin/products/:id/price-history",
    evidence: "phase-9",
  },
  { reference: "customers.png", route: "/admin/customers", evidence: "phase-6" },
  {
    reference: "ledger.png",
    route: "/admin/customers/:id/ledger",
    evidence: "phase-9",
  },
  {
    reference: "record-purchase.png",
    route: "/admin/transactions/purchase",
    evidence: "phase-7",
  },
  {
    reference: "record-payment.png",
    route: "/admin/transactions/payment",
    evidence: "phase-7",
  },
  { reference: "offline.png", route: "/offline", evidence: "phase-8" },
] as const;

const countPngEvidence = (phaseDir: string): number => {
  const absolute = resolve(
    process.cwd(),
    "contexts/execution/app-reference-redesign/evidence",
    phaseDir,
  );
  if (!existsSync(absolute)) {
    return 0;
  }

  let count = 0;
  for (const entry of readdirSync(absolute, { withFileTypes: true })) {
    if (entry.isFile() && entry.name.endsWith(".png")) {
      count += 1;
    }
  }
  return count;
};

describe("phase 9 release-candidate gate", () => {
  it("documents every authoritative verification command", () => {
    for (const script of REQUIRED_GATES) {
      expect(packageJson.scripts[script], `missing npm run ${script}`).toBeTruthy();
    }
  });

  it("maps every redesign reference to a route and evidence phase", () => {
    expect(REFERENCE_PAGES).toHaveLength(10);
    for (const page of REFERENCE_PAGES) {
      expect(page.route.startsWith("/")).toBe(true);
      expect(page.evidence).toMatch(/^phase-[0-9]$/);
    }
  });

  it("keeps public evidence for unauthenticated pages", () => {
    expect(countPngEvidence("phase-4")).toBeGreaterThanOrEqual(16);
    expect(countPngEvidence("phase-8")).toBeGreaterThanOrEqual(16);
  });

  it("rejects open redirects after authentication", () => {
    expect(resolvePostAuthPath("/admin", "?next=https://evil.example")).toBe(
      "/admin/overview",
    );
    expect(resolvePostAuthPath("/admin", "?next=//evil.example/admin")).toBe(
      "/admin/overview",
    );
  });

  it("excludes large logo sources and reference boards from precache", () => {
    expect(PRECACHE_EXCLUDE_PATTERNS.length).toBeGreaterThan(0);
    expect(
      shouldExcludeFromPrecache(
        "src/components/app/assets/logo/light-mode.svg",
      ),
    ).toBe(true);
    expect(
      shouldExcludeFromPrecache(
        "src/components/app/assets/pages/offline.png",
      ),
    ).toBe(true);
    expect(shouldExcludeFromPrecache("public/icons/icon-192x192.png")).toBe(
      false,
    );
  });

  it("does not cache private API responses in the service worker", () => {
    const policy = read("src/lib/pwa/cache-policy.ts");
    expect(policy).toContain("NetworkOnly");
    expect(policy).toContain("PRIVATE_CACHE_URL_PATTERNS");
  });

  it("avoids logging customer PII in redesigned client surfaces", () => {
    const forbiddenLogPatterns = [
      /console\.log\([^)]*phone/i,
      /console\.log\([^)]*balance/i,
      /console\.log\([^)]*customerId/i,
    ];

    const clientSources = [
      "src/components/app/pages/CustomersPage.tsx",
      "src/components/app/pages/CustomerLedgerPage.tsx",
      "src/components/app/pages/RecordPaymentPage.tsx",
      "src/components/app/pages/RecordPurchasePage.tsx",
    ];

    for (const sourcePath of clientSources) {
      const source = read(sourcePath);
      for (const pattern of forbiddenLogPatterns) {
        expect(source).not.toMatch(pattern);
      }
    }
  });

  it("keeps financial mutations server-authoritative", () => {
    const purchasePage = read("src/components/app/pages/RecordPurchasePage.tsx");
    const paymentPage = read("src/components/app/pages/RecordPaymentPage.tsx");
    const debtApi = read("src/pages/api/customers/[id]/ledger/debt.ts");
    const paymentApi = read(
      "src/pages/api/customers/[id]/ledger/payment.ts",
    );

    expect(purchasePage).toContain("idempotencyKey");
    expect(purchasePage).toContain("/ledger/debt");
    expect(paymentPage).toContain("idempotencyKey");
    expect(paymentPage).toContain("/ledger/payment");
    expect(debtApi).toContain("createCustomerLedgerService");
    expect(paymentApi).toContain("createCustomerLedgerService");
    expect(purchasePage).not.toMatch(/localStorage\.setItem/);
    expect(paymentPage).not.toMatch(/localStorage\.setItem/);
  });

  it("ships accessibility landmarks on public and offline pages", () => {
    const landing = read("src/pages/index.astro");
    const offline = read("src/pages/offline.astro");
    const baseLayout = read("src/layouts/BaseLayout.astro");
    const adminShell = read("src/components/app/layout/AdminShell.tsx");

    expect(landing).toContain('id="main-content"');
    expect(offline).toContain("OfflinePage");
    expect(baseLayout).toContain("Skip to content");
    expect(adminShell).toContain('id="main-content"');
  });
});
