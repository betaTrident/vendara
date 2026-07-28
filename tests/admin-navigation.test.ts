import { describe, expect, test } from "vitest";

import {
  ADMIN_MOBILE_PRIMARY_NAV,
  ADMIN_SIDEBAR_NAV,
  isAdminNavItemActive,
} from "@/components/app/navigation/admin-navigation";
import { parseAdminLocation } from "@/lib/admin/routes";

describe("admin navigation contracts", () => {
  test("exposes at most five mobile primary destinations", () => {
    expect(ADMIN_MOBILE_PRIMARY_NAV.length).toBeLessThanOrEqual(5);
    expect(ADMIN_MOBILE_PRIMARY_NAV.map((item) => item.id)).toEqual([
      "overview",
      "products",
      "customers",
      "purchase",
      "more",
    ]);
  });

  test("sidebar exposes only destinations that can be opened without a selected record", () => {
    const ids = ADMIN_SIDEBAR_NAV.map((item) => item.id);
    expect(ids).toEqual(["overview", "products", "customers", "purchase", "payment"]);
  });

  test("marks only one sidebar item active for contextual detail routes", () => {
    const priceHistory = parseAdminLocation(
      "/admin/products/00000000-0000-4000-8000-000000000001/price-history",
    );
    const customerLedger = parseAdminLocation(
      "/admin/customers/00000000-0000-4000-8000-000000000001/ledger",
    );

    expect(
      ADMIN_SIDEBAR_NAV.filter((item) => isAdminNavItemActive(item, priceHistory)).map(
        (item) => item.id,
      ),
    ).toEqual(["products"]);
    expect(
      ADMIN_SIDEBAR_NAV.filter((item) => isAdminNavItemActive(item, customerLedger)).map(
        (item) => item.id,
      ),
    ).toEqual(["customers"]);
  });

  test("marks the matching route active without treating entry as overview", () => {
    const overview = parseAdminLocation("/admin/overview");
    const products = parseAdminLocation("/admin/products");
    const entry = parseAdminLocation("/admin");

    expect(
      isAdminNavItemActive(ADMIN_SIDEBAR_NAV.find((item) => item.id === "overview")!, overview),
    ).toBe(true);
    expect(
      isAdminNavItemActive(ADMIN_SIDEBAR_NAV.find((item) => item.id === "products")!, products),
    ).toBe(true);
    expect(
      isAdminNavItemActive(ADMIN_SIDEBAR_NAV.find((item) => item.id === "overview")!, entry),
    ).toBe(false);
  });
});
