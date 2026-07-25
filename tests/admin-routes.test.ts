import { describe, expect, test } from "vitest";

import {
  ADMIN_OVERVIEW_PATH,
  buildAdminHref,
  isSafeAdminReturnPath,
  parseAdminLocation,
  resolvePostAuthPath,
  titleForAdminRoute,
} from "@/lib/admin/routes";

describe("admin route resolution", () => {
  test("resolves canonical authenticated routes and UUIDs", () => {
    expect(parseAdminLocation("/admin")).toEqual({
      name: "entry",
      pathname: "/admin",
    });
    expect(parseAdminLocation("/admin/")).toEqual({
      name: "entry",
      pathname: "/admin",
    });
    expect(parseAdminLocation("/admin/overview")).toEqual({
      name: "overview",
      pathname: "/admin/overview",
    });
    expect(parseAdminLocation("/admin/products")).toEqual({
      name: "products",
      pathname: "/admin/products",
    });
    expect(
      parseAdminLocation(
        "/admin/products/11111111-1111-4111-8111-111111111111/price-history",
      ),
    ).toEqual({
      name: "product-price-history",
      pathname:
        "/admin/products/11111111-1111-4111-8111-111111111111/price-history",
      productId: "11111111-1111-4111-8111-111111111111",
    });
    expect(parseAdminLocation("/admin/customers")).toEqual({
      name: "customers",
      pathname: "/admin/customers",
    });
    expect(
      parseAdminLocation(
        "/admin/customers/22222222-2222-4222-8222-222222222222/ledger",
      ),
    ).toEqual({
      name: "customer-ledger",
      pathname: "/admin/customers/22222222-2222-4222-8222-222222222222/ledger",
      customerId: "22222222-2222-4222-8222-222222222222",
    });
    expect(parseAdminLocation("/admin/transactions/purchase")).toEqual({
      name: "record-purchase",
      pathname: "/admin/transactions/purchase",
    });
    expect(parseAdminLocation("/admin/transactions/payment")).toEqual({
      name: "record-payment",
      pathname: "/admin/transactions/payment",
    });
  });

  test("rejects invalid UUID segments as not-found", () => {
    expect(parseAdminLocation("/admin/products/not-a-uuid/price-history")).toEqual({
      name: "not-found",
      pathname: "/admin/products/not-a-uuid/price-history",
      requestedPath: "/admin/products/not-a-uuid/price-history",
    });
    expect(parseAdminLocation("/admin/customers/abc/ledger")).toEqual({
      name: "not-found",
      pathname: "/admin/customers/abc/ledger",
      requestedPath: "/admin/customers/abc/ledger",
    });
  });

  test("marks unknown admin paths as not-found", () => {
    expect(parseAdminLocation("/admin/settings")).toEqual({
      name: "not-found",
      pathname: "/admin/settings",
      requestedPath: "/admin/settings",
    });
    expect(parseAdminLocation("/admin/overview/extra")).toEqual({
      name: "not-found",
      pathname: "/admin/overview/extra",
      requestedPath: "/admin/overview/extra",
    });
  });

  test("reads only approved query ids and ignores unsafe values", () => {
    const withProduct = parseAdminLocation(
      "/admin/products?product=11111111-1111-4111-8111-111111111111",
    );
    expect(withProduct).toMatchObject({
      name: "products",
      productId: "11111111-1111-4111-8111-111111111111",
    });

    const withBadProduct = parseAdminLocation("/admin/products?product=nope");
    expect(withBadProduct).toMatchObject({
      name: "products",
    });
    expect("productId" in withBadProduct && withBadProduct.productId).toBeFalsy();

    const withCustomer = parseAdminLocation(
      "/admin/customers?customer=22222222-2222-4222-8222-222222222222",
    );
    expect(withCustomer).toMatchObject({
      name: "customers",
      customerId: "22222222-2222-4222-8222-222222222222",
    });
  });

  test("builds stable hrefs without leaking external destinations", () => {
    expect(buildAdminHref({ name: "overview" })).toBe("/admin/overview");
    expect(
      buildAdminHref({
        name: "product-price-history",
        productId: "11111111-1111-4111-8111-111111111111",
      }),
    ).toBe("/admin/products/11111111-1111-4111-8111-111111111111/price-history");
    expect(
      buildAdminHref({
        name: "customers",
        customerId: "22222222-2222-4222-8222-222222222222",
      }),
    ).toBe("/admin/customers?customer=22222222-2222-4222-8222-222222222222");
  });

  test("titles routes for document history restoration", () => {
    expect(titleForAdminRoute(parseAdminLocation("/admin/overview"))).toContain(
      "Overview",
    );
    expect(titleForAdminRoute(parseAdminLocation("/admin/products"))).toContain(
      "Products",
    );
    expect(
      titleForAdminRoute(parseAdminLocation("/admin/mystery")),
    ).toContain("Not found");
  });
});

describe("safe admin return paths", () => {
  test("accepts only internal admin destinations", () => {
    expect(isSafeAdminReturnPath("/admin")).toBe(true);
    expect(isSafeAdminReturnPath("/admin/overview")).toBe(true);
    expect(isSafeAdminReturnPath("/admin/products")).toBe(true);
    expect(isSafeAdminReturnPath("/admin/customers?customer=22222222-2222-4222-8222-222222222222")).toBe(
      true,
    );
  });

  test("rejects open redirects and non-admin targets", () => {
    expect(isSafeAdminReturnPath("https://evil.example/admin")).toBe(false);
    expect(isSafeAdminReturnPath("//evil.example/admin")).toBe(false);
    expect(isSafeAdminReturnPath("/\\evil.example")).toBe(false);
    expect(isSafeAdminReturnPath("/login")).toBe(false);
    expect(isSafeAdminReturnPath("/")).toBe(false);
    expect(isSafeAdminReturnPath("admin/overview")).toBe(false);
    expect(isSafeAdminReturnPath("/admin/../api/secret")).toBe(false);
    expect(isSafeAdminReturnPath("/admin/%2e%2e/api")).toBe(false);
    expect(isSafeAdminReturnPath("")).toBe(false);
  });

  test("post-auth landing prefers a safe requested path, otherwise overview", () => {
    expect(resolvePostAuthPath("/admin", "")).toBe(ADMIN_OVERVIEW_PATH);
    expect(resolvePostAuthPath("/admin/", "")).toBe(ADMIN_OVERVIEW_PATH);
    expect(resolvePostAuthPath("/admin/products", "")).toBe("/admin/products");
    expect(
      resolvePostAuthPath("/admin", "?next=/admin/customers"),
    ).toBe("/admin/customers");
    expect(
      resolvePostAuthPath("/admin", "?next=https://evil.example"),
    ).toBe(ADMIN_OVERVIEW_PATH);
    expect(
      resolvePostAuthPath("/admin", "?next=/admin/../api"),
    ).toBe(ADMIN_OVERVIEW_PATH);
  });
});
