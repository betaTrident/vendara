import type { LucideIcon } from "lucide-react";
import {
  CreditCard,
  LayoutDashboard,
  MoreHorizontal,
  Package,
  ShoppingBag,
  Users,
  BookOpen,
} from "lucide-react";

import {
  buildAdminHref,
  type AdminRoute,
} from "@/lib/admin/routes";

export type AdminNavId =
  | "overview"
  | "products"
  | "customers"
  | "ledger"
  | "purchase"
  | "payment"
  | "more";

export interface AdminNavItem {
  id: AdminNavId;
  label: string;
  href: string;
  icon: LucideIcon;
  /** Route names that should mark this item active. */
  match: AdminRoute["name"][];
  /** When true, item opens a local "more" panel instead of navigating. */
  isPanel?: boolean;
}

export const ADMIN_SIDEBAR_NAV: AdminNavItem[] = [
  {
    id: "overview",
    label: "Overview",
    href: buildAdminHref({ name: "overview" }),
    icon: LayoutDashboard,
    match: ["overview"],
  },
  {
    id: "products",
    label: "Products",
    href: buildAdminHref({ name: "products" }),
    icon: Package,
    match: ["products", "product-price-history"],
  },
  {
    id: "customers",
    label: "Customers",
    href: buildAdminHref({ name: "customers" }),
    icon: Users,
    match: ["customers", "customer-ledger"],
  },
  {
    id: "purchase",
    label: "Record purchase",
    href: buildAdminHref({ name: "record-purchase" }),
    icon: ShoppingBag,
    match: ["record-purchase"],
  },
  {
    id: "payment",
    label: "Record payment",
    href: buildAdminHref({ name: "record-payment" }),
    icon: CreditCard,
    match: ["record-payment"],
  },
];

export const ADMIN_MOBILE_PRIMARY_NAV: AdminNavItem[] = [
  {
    id: "overview",
    label: "Overview",
    href: buildAdminHref({ name: "overview" }),
    icon: LayoutDashboard,
    match: ["overview"],
  },
  {
    id: "products",
    label: "Products",
    href: buildAdminHref({ name: "products" }),
    icon: Package,
    match: ["products", "product-price-history"],
  },
  {
    id: "customers",
    label: "Customers",
    href: buildAdminHref({ name: "customers" }),
    icon: Users,
    match: ["customers"],
  },
  {
    id: "ledger",
    label: "Ledger",
    href: buildAdminHref({ name: "customers" }),
    icon: BookOpen,
    match: ["customer-ledger"],
  },
  {
    id: "more",
    label: "More",
    href: "#more",
    icon: MoreHorizontal,
    match: ["record-purchase", "record-payment"],
    isPanel: true,
  },
];

export const ADMIN_MORE_NAV: AdminNavItem[] = [
  {
    id: "purchase",
    label: "Record purchase",
    href: buildAdminHref({ name: "record-purchase" }),
    icon: ShoppingBag,
    match: ["record-purchase"],
  },
  {
    id: "payment",
    label: "Record payment",
    href: buildAdminHref({ name: "record-payment" }),
    icon: CreditCard,
    match: ["record-payment"],
  },
];

export function isAdminNavItemActive(
  item: AdminNavItem,
  route: AdminRoute,
): boolean {
  return item.match.includes(route.name);
}
