import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

import {
  buildLastSafeViewPath,
  clearLastSafeViewPath,
  isLastSafeAdminRoute,
  LAST_SAFE_VIEW_STORAGE_KEY,
  readLastSafeViewPath,
  writeLastSafeViewPath,
} from "@/lib/pwa/last-safe-view";
import { hasDirtyForm } from "@/lib/pwa/dirty-form";
import type { AdminRoute } from "@/lib/admin/routes";

const createSessionStorageMock = () => {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
};

describe("last safe admin view", () => {
  beforeEach(() => {
    vi.stubGlobal("sessionStorage", createSessionStorageMock());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("accepts read-only admin routes and rejects financial forms", () => {
    const overview: AdminRoute = { name: "overview", pathname: "/admin/overview" };
    const purchase: AdminRoute = {
      name: "record-purchase",
      pathname: "/admin/transactions/purchase",
    };

    expect(isLastSafeAdminRoute(overview)).toBe(true);
    expect(isLastSafeAdminRoute(purchase)).toBe(false);
  });

  it("persists only safe internal admin paths", () => {
    writeLastSafeViewPath("/admin/overview");
    expect(readLastSafeViewPath()).toBe("/admin/overview");

    writeLastSafeViewPath("https://evil.test/admin/overview");
    expect(readLastSafeViewPath()).toBe("/admin/overview");

    writeLastSafeViewPath("/admin/transactions/purchase");
    expect(readLastSafeViewPath()).toBe("/admin/overview");
  });

  it("clears invalid stored values", () => {
    sessionStorage.setItem(LAST_SAFE_VIEW_STORAGE_KEY, "//evil.test/admin");
    expect(readLastSafeViewPath()).toBeNull();
    expect(sessionStorage.getItem(LAST_SAFE_VIEW_STORAGE_KEY)).toBeNull();
  });

  it("builds stable paths for every read-only admin route", () => {
    const productId = "11111111-1111-4111-8111-111111111111";
    const customerId = "22222222-2222-4222-8222-222222222222";

    expect(
      buildLastSafeViewPath({ name: "overview", pathname: "/admin/overview" }),
    ).toBe("/admin/overview");
    expect(
      buildLastSafeViewPath({
        name: "products",
        pathname: "/admin/products",
        productId,
      }),
    ).toBe(`/admin/products?product=${productId}`);
    expect(
      buildLastSafeViewPath({
        name: "product-price-history",
        pathname: `/admin/products/${productId}/price-history`,
        productId,
      }),
    ).toBe(`/admin/products/${productId}/price-history`);
    expect(
      buildLastSafeViewPath({
        name: "customers",
        pathname: "/admin/customers",
        customerId,
      }),
    ).toBe(`/admin/customers?customer=${customerId}`);
    expect(
      buildLastSafeViewPath({
        name: "customer-ledger",
        pathname: `/admin/customers/${customerId}/ledger`,
        customerId,
      }),
    ).toBe(`/admin/customers/${customerId}/ledger`);
    expect(
      buildLastSafeViewPath({
        name: "record-payment",
        pathname: "/admin/transactions/payment",
      }),
    ).toBeNull();
  });

  it("clears stored safe paths", () => {
    writeLastSafeViewPath("/admin/customers");
    clearLastSafeViewPath();
    expect(readLastSafeViewPath()).toBeNull();
  });

  it("no-ops when sessionStorage is unavailable", () => {
    vi.unstubAllGlobals();
    vi.stubGlobal("sessionStorage", undefined);

    expect(readLastSafeViewPath()).toBeNull();
    expect(() => writeLastSafeViewPath("/admin/overview")).not.toThrow();
    expect(() => clearLastSafeViewPath()).not.toThrow();
  });
});

describe("hasDirtyForm", () => {
  beforeEach(() => {
    vi.stubGlobal("document", {
      querySelector: (selector: string) =>
        documentBody.querySelector(selector),
      body: {
        set innerHTML(value: string) {
          documentBody.innerHTML = value;
        },
        get innerHTML() {
          return documentBody.innerHTML;
        },
      },
    });

    let documentBody = {
      innerHTML: "",
      querySelector(selector: string) {
        if (!this.innerHTML) {
          return null;
        }
        if (selector.includes("data-vendara-dirty")) {
          return this.innerHTML.includes('data-vendara-dirty="true"')
            ? {}
            : null;
        }
        return null;
      },
    };
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("detects dirty form markers used by transaction flows", () => {
    expect(hasDirtyForm()).toBe(false);

    document.body.innerHTML =
      '<form data-vendara-dirty="true"><input name="amount" /></form>';
    expect(hasDirtyForm()).toBe(true);
  });

  it("returns false during server-side rendering", () => {
    vi.unstubAllGlobals();
    vi.stubGlobal("document", undefined);
    expect(hasDirtyForm()).toBe(false);
  });
});

describe("PWA reconnect state", () => {
  it("exports reconnect helpers from use-pwa-state module source", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/lib/pwa/use-pwa-state.ts"),
      "utf8",
    );
    expect(source).toContain("reconnected");
    expect(source).toContain("acknowledgeReconnected");
  });
});
