import { useState } from "react";

import {
  ADMIN_MOBILE_PRIMARY_NAV,
  ADMIN_MORE_NAV,
  isAdminNavItemActive,
} from "@/components/app/navigation/admin-navigation";
import type { AdminRoute } from "@/lib/admin/routes";
import { cn } from "@/lib/utils";

interface MobileBottomNavigationProps {
  route: AdminRoute;
  onNavigate: (href: string) => void;
}

export function MobileBottomNavigation({
  route,
  onNavigate,
}: MobileBottomNavigationProps) {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 md:hidden">
      {moreOpen ? (
        <div
          className="border-t border-hairline bg-card px-3 py-2 shadow-lg"
          role="menu"
          aria-label="More navigation"
        >
          {ADMIN_MORE_NAV.map((item) => {
            const Icon = item.icon;
            const active = isAdminNavItemActive(item, route);
            return (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                data-nav-id={item.id}
                onClick={() => {
                  setMoreOpen(false);
                  onNavigate(item.href);
                }}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-3 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active ? "bg-primary/10 text-primary" : "text-ink",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}

      <nav
        className="border-t border-hairline bg-card/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]"
        aria-label="Mobile primary"
      >
        <ul className="grid grid-cols-5">
          {ADMIN_MOBILE_PRIMARY_NAV.map((item) => {
            const Icon = item.icon;
            const active =
              item.isPanel
                ? moreOpen || isAdminNavItemActive(item, route)
                : isAdminNavItemActive(item, route);

            return (
              <li key={item.id}>
                <button
                  type="button"
                  data-nav-id={item.id}
                  data-active={active ? "true" : "false"}
                  aria-current={active && !item.isPanel ? "page" : undefined}
                  aria-expanded={item.isPanel ? moreOpen : undefined}
                  onClick={() => {
                    if (item.isPanel) {
                      setMoreOpen((open) => !open);
                      return;
                    }
                    setMoreOpen(false);
                    onNavigate(item.href);
                  }}
                  className={cn(
                    "flex min-h-14 w-full flex-col items-center justify-center gap-1 px-1 text-[10px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    active ? "text-primary" : "text-muted-text",
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
