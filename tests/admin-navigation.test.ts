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
      "ledger",
      "more",
    ]);
  });

  test("sidebar includes overview, products, and customers", () => {
    const ids = ADMIN_SIDEBAR_NAV.map((item) => item.id);
    expect(ids).toContain("overview");
    expect(ids).toContain("products");
    expect(ids).toContain("customers");
  });

  test("marks the matching route active without treating entry as overview", () => {
    const overview = parseAdminLocation("/admin/overview");
    const products = parseAdminLocation("/admin/products");
    const entry = parseAdminLocation("/admin");

    expect(
      isAdminNavItemActive(
        ADMIN_SIDEBAR_NAV.find((item) => item.id === "overview")!,
        overview,
      ),
    ).toBe(true);
    expect(
      isAdminNavItemActive(
        ADMIN_SIDEBAR_NAV.find((item) => item.id === "products")!,
        products,
      ),
    ).toBe(true);
    expect(
      isAdminNavItemActive(
        ADMIN_SIDEBAR_NAV.find((item) => item.id === "overview")!,
        entry,
      ),
    ).toBe(false);
  });
});
