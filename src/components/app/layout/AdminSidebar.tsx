import { VendaraLogo } from "@/components/app/branding/VendaraLogo";
import { StoreStatusCard } from "@/components/app/layout/StoreStatusCard";
import {
  ADMIN_SIDEBAR_NAV,
  isAdminNavItemActive,
  type AdminNavItem,
} from "@/components/app/navigation/admin-navigation";
import { ADMIN_OVERVIEW_PATH, type AdminRoute } from "@/lib/admin/routes";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  route: AdminRoute;
  isOnline?: boolean;
  onNavigate: (href: string) => void;
  className?: string;
}

function NavButton({
  item,
  active,
  onNavigate,
}: {
  item: AdminNavItem;
  active: boolean;
  onNavigate: (href: string) => void;
}) {
  const Icon = item.icon;

  return (
    <button
      type="button"
      data-nav-id={item.id}
      data-active={active ? "true" : "false"}
      aria-current={active ? "page" : undefined}
      onClick={() => onNavigate(item.href)}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted-text hover:bg-surface-soft hover:text-ink",
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      <span>{item.label}</span>
    </button>
  );
}

export function AdminSidebar({
  route,
  isOnline,
  onNavigate,
  className,
}: AdminSidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full w-[248px] shrink-0 flex-col border-r border-hairline bg-card",
        className,
      )}
      aria-label="Admin navigation"
    >
      <div className="flex h-14 items-center border-b border-hairline-soft px-4">
        <a
          href={ADMIN_OVERVIEW_PATH}
          onClick={(event) => {
            event.preventDefault();
            onNavigate(ADMIN_OVERVIEW_PATH);
          }}
          className="rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Vendara overview"
        >
          <VendaraLogo variant="horizontal" className="h-7 max-w-[148px]" />
        </a>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Primary">
        {ADMIN_SIDEBAR_NAV.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            active={isAdminNavItemActive(item, route)}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      <div className="border-t border-hairline p-3">
        <StoreStatusCard isOnline={isOnline} />
      </div>
    </aside>
  );
}
