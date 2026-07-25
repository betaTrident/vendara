/**
 * Typed admin route resolver and open-redirect-safe return-path helpers.
 * Keep all admin destinations path-based; never trust raw external return URLs.
 */

export const ADMIN_ENTRY_PATH = "/admin";
export const ADMIN_OVERVIEW_PATH = "/admin/overview";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type AdminRouteName =
  | "entry"
  | "overview"
  | "products"
  | "product-price-history"
  | "customers"
  | "customer-ledger"
  | "record-purchase"
  | "record-payment"
  | "not-found";

export type AdminRoute =
  | { name: "entry"; pathname: typeof ADMIN_ENTRY_PATH }
  | { name: "overview"; pathname: typeof ADMIN_OVERVIEW_PATH }
  | {
      name: "products";
      pathname: "/admin/products";
      productId?: string;
    }
  | {
      name: "product-price-history";
      pathname: string;
      productId: string;
    }
  | {
      name: "customers";
      pathname: "/admin/customers";
      customerId?: string;
    }
  | {
      name: "customer-ledger";
      pathname: string;
      customerId: string;
    }
  | {
      name: "record-purchase";
      pathname: "/admin/transactions/purchase";
      customerId?: string;
    }
  | {
      name: "record-payment";
      pathname: "/admin/transactions/payment";
      customerId?: string;
    }
  | {
      name: "not-found";
      pathname: string;
      requestedPath: string;
    };

export type AdminHrefTarget =
  | { name: "overview" }
  | { name: "products"; productId?: string }
  | { name: "product-price-history"; productId: string }
  | { name: "customers"; customerId?: string }
  | { name: "customer-ledger"; customerId: string }
  | { name: "record-purchase"; customerId?: string }
  | { name: "record-payment"; customerId?: string };

function normalizePathname(pathname: string): string {
  if (!pathname) {
    return ADMIN_ENTRY_PATH;
  }

  const trimmed = pathname.trim();
  if (trimmed === "/admin/") {
    return ADMIN_ENTRY_PATH;
  }

  if (trimmed.length > 1 && trimmed.endsWith("/")) {
    return trimmed.slice(0, -1);
  }

  return trimmed;
}

export function isAdminUuid(value: string | null | undefined): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

function notFound(pathname: string): AdminRoute {
  return {
    name: "not-found",
    pathname,
    requestedPath: pathname,
  };
}

function readSearchParams(input: string | URLSearchParams | undefined): URLSearchParams {
  if (!input) {
    return new URLSearchParams();
  }

  if (typeof input === "string") {
    const normalized = input.startsWith("?") ? input.slice(1) : input;
    return new URLSearchParams(normalized);
  }

  return input;
}

/**
 * Parse an admin location into a typed route.
 * Accepts pathname alone, pathname+search, or a full path with query.
 */
export function parseAdminLocation(
  location: string,
  search?: string | URLSearchParams,
): AdminRoute {
  const [rawPath, rawQuery = ""] = location.split("?");
  const pathname = normalizePathname(rawPath);
  const params = readSearchParams(search ?? rawQuery);

  if (pathname === ADMIN_ENTRY_PATH) {
    return { name: "entry", pathname: ADMIN_ENTRY_PATH };
  }

  if (pathname === ADMIN_OVERVIEW_PATH) {
    return { name: "overview", pathname: ADMIN_OVERVIEW_PATH };
  }

  if (pathname === "/admin/products") {
    const productId = params.get("product");
    return isAdminUuid(productId)
      ? { name: "products", pathname: "/admin/products", productId }
      : { name: "products", pathname: "/admin/products" };
  }

  const priceHistoryMatch = pathname.match(
    /^\/admin\/products\/([^/]+)\/price-history$/,
  );
  if (priceHistoryMatch) {
    const productId = priceHistoryMatch[1];
    if (!isAdminUuid(productId)) {
      return notFound(pathname);
    }
    return {
      name: "product-price-history",
      pathname,
      productId,
    };
  }

  if (pathname === "/admin/customers") {
    const customerId = params.get("customer");
    return isAdminUuid(customerId)
      ? { name: "customers", pathname: "/admin/customers", customerId }
      : { name: "customers", pathname: "/admin/customers" };
  }

  const ledgerMatch = pathname.match(/^\/admin\/customers\/([^/]+)\/ledger$/);
  if (ledgerMatch) {
    const customerId = ledgerMatch[1];
    if (!isAdminUuid(customerId)) {
      return notFound(pathname);
    }
    return {
      name: "customer-ledger",
      pathname,
      customerId,
    };
  }

  if (pathname === "/admin/transactions/purchase") {
    const customerId = params.get("customer");
    return isAdminUuid(customerId)
      ? {
          name: "record-purchase",
          pathname: "/admin/transactions/purchase",
          customerId,
        }
      : { name: "record-purchase", pathname: "/admin/transactions/purchase" };
  }

  if (pathname === "/admin/transactions/payment") {
    const customerId = params.get("customer");
    return isAdminUuid(customerId)
      ? {
          name: "record-payment",
          pathname: "/admin/transactions/payment",
          customerId,
        }
      : { name: "record-payment", pathname: "/admin/transactions/payment" };
  }

  if (pathname.startsWith("/admin/")) {
    return notFound(pathname);
  }

  return notFound(pathname);
}

export function buildAdminHref(target: AdminHrefTarget): string {
  switch (target.name) {
    case "overview":
      return ADMIN_OVERVIEW_PATH;
    case "products": {
      if (target.productId && isAdminUuid(target.productId)) {
        return `/admin/products?product=${target.productId}`;
      }
      return "/admin/products";
    }
    case "product-price-history":
      return `/admin/products/${target.productId}/price-history`;
    case "customers": {
      if (target.customerId && isAdminUuid(target.customerId)) {
        return `/admin/customers?customer=${target.customerId}`;
      }
      return "/admin/customers";
    }
    case "customer-ledger":
      return `/admin/customers/${target.customerId}/ledger`;
    case "record-purchase": {
      if (target.customerId && isAdminUuid(target.customerId)) {
        return `/admin/transactions/purchase?customer=${target.customerId}`;
      }
      return "/admin/transactions/purchase";
    }
    case "record-payment": {
      if (target.customerId && isAdminUuid(target.customerId)) {
        return `/admin/transactions/payment?customer=${target.customerId}`;
      }
      return "/admin/transactions/payment";
    }
    default: {
      const _exhaustive: never = target;
      return _exhaustive;
    }
  }
}

export function titleForAdminRoute(route: AdminRoute): string {
  switch (route.name) {
    case "entry":
      return "Admin sign in — Vendara";
    case "overview":
      return "Overview — Vendara";
    case "products":
      return "Products — Vendara";
    case "product-price-history":
      return "Price history — Vendara";
    case "customers":
      return "Customers — Vendara";
    case "customer-ledger":
      return "Customer ledger — Vendara";
    case "record-purchase":
      return "Record purchase — Vendara";
    case "record-payment":
      return "Record payment — Vendara";
    case "not-found":
      return "Not found — Vendara";
    default: {
      const _exhaustive: never = route;
      return _exhaustive;
    }
  }
}

/**
 * Reject open redirects: only same-origin relative `/admin...` paths are safe.
 */
export function isSafeAdminReturnPath(candidate: string | null | undefined): boolean {
  if (!candidate || typeof candidate !== "string") {
    return false;
  }

  const value = candidate.trim();
  if (!value.startsWith("/admin")) {
    return false;
  }

  if (value.startsWith("//") || value.includes("://") || value.includes("\\")) {
    return false;
  }

  if (value.includes("%2e") || value.includes("%2E") || value.includes("..")) {
    return false;
  }

  try {
    const url = new URL(value, "https://vendara.local");
    if (url.origin !== "https://vendara.local") {
      return false;
    }
    if (!url.pathname.startsWith("/admin")) {
      return false;
    }
    if (url.pathname.includes("..")) {
      return false;
    }
    // Re-parse to ensure the path is a known shape or not-found (still internal).
    const route = parseAdminLocation(`${url.pathname}${url.search}`);
    return route.name !== "entry" || url.pathname === ADMIN_ENTRY_PATH;
  } catch {
    return false;
  }
}

function extractNextParam(search: string | URLSearchParams): string | null {
  const params = readSearchParams(search);
  return params.get("next");
}

/**
 * After a valid session, map `/admin` (and unsafe next params) to overview.
 * Preserve deep links when they are already safe internal admin paths.
 */
export function resolvePostAuthPath(
  pathname: string,
  search: string | URLSearchParams = "",
): string {
  const normalized = normalizePathname(pathname);
  const next = extractNextParam(search);

  if (next && isSafeAdminReturnPath(next)) {
    const url = new URL(next, "https://vendara.local");
    return `${url.pathname}${url.search}`;
  }

  if (normalized === ADMIN_ENTRY_PATH) {
    return ADMIN_OVERVIEW_PATH;
  }

  if (normalized.startsWith("/admin/") && isSafeAdminReturnPath(normalized)) {
    const params = readSearchParams(search);
    const query = params.toString();
    // Drop consumed `next` if present on a deep link.
    params.delete("next");
    const cleaned = params.toString();
    return cleaned ? `${normalized}?${cleaned}` : normalized;
  }

  return ADMIN_OVERVIEW_PATH;
}

export function getCurrentAdminLocation(
  location: Pick<Location, "pathname" | "search">,
): AdminRoute {
  return parseAdminLocation(location.pathname, location.search);
}
