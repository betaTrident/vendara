import {
  buildAdminHref,
  isSafeAdminReturnPath,
  type AdminRoute,
} from "@/lib/admin/routes";

export const LAST_SAFE_VIEW_STORAGE_KEY = "vendara:last-safe-admin-path";

/** Routes that may be reopened from the offline fallback without financial risk. */
export const LAST_SAFE_ADMIN_ROUTE_NAMES = [
  "overview",
  "products",
  "product-price-history",
  "customers",
  "customer-ledger",
] as const;

export type LastSafeAdminRouteName = (typeof LAST_SAFE_ADMIN_ROUTE_NAMES)[number];

export function isLastSafeAdminRoute(route: AdminRoute): route is AdminRoute & {
  name: LastSafeAdminRouteName;
} {
  return LAST_SAFE_ADMIN_ROUTE_NAMES.includes(
    route.name as LastSafeAdminRouteName,
  );
}

export function buildLastSafeViewPath(route: AdminRoute): string | null {
  if (!isLastSafeAdminRoute(route)) {
    return null;
  }

  switch (route.name) {
    case "overview":
      return buildAdminHref({ name: "overview" });
    case "products":
      return buildAdminHref({
        name: "products",
        productId: route.productId,
      });
    case "product-price-history":
      return buildAdminHref({
        name: "product-price-history",
        productId: route.productId,
      });
    case "customers":
      return buildAdminHref({
        name: "customers",
        customerId: route.customerId,
      });
    case "customer-ledger":
      return buildAdminHref({
        name: "customer-ledger",
        customerId: route.customerId,
      });
    default: {
      const _exhaustive: never = route;
      return _exhaustive;
    }
  }
}

export function readLastSafeViewPath(): string | null {
  if (typeof sessionStorage === "undefined") {
    return null;
  }

  const stored = sessionStorage.getItem(LAST_SAFE_VIEW_STORAGE_KEY);
  if (!stored || !isSafeAdminReturnPath(stored)) {
    sessionStorage.removeItem(LAST_SAFE_VIEW_STORAGE_KEY);
    return null;
  }

  return stored;
}

export function writeLastSafeViewPath(path: string): void {
  if (typeof sessionStorage === "undefined") {
    return;
  }

  if (!isSafeAdminReturnPath(path)) {
    return;
  }

  const route = path.split("?")[0] ?? path;
  if (
    route === "/admin/transactions/purchase" ||
    route === "/admin/transactions/payment"
  ) {
    return;
  }

  sessionStorage.setItem(LAST_SAFE_VIEW_STORAGE_KEY, path);
}

export function clearLastSafeViewPath(): void {
  if (typeof sessionStorage === "undefined") {
    return;
  }

  sessionStorage.removeItem(LAST_SAFE_VIEW_STORAGE_KEY);
}
