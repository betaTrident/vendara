import { Bell, LogOut, Menu, Search } from "lucide-react";

import { VendaraLogo } from "@/components/app/branding/VendaraLogo";
import { ConnectionStatus } from "@/components/app/ConnectionStatus";
import { ThemeMenu } from "@/components/app/theme/ThemeMenu";
import { ADMIN_OVERVIEW_PATH } from "@/lib/admin/routes";

interface AdminTopBarProps {
  isOnline?: boolean;
  onLogout?: () => void;
  onOpenSidebar?: () => void;
  showMenuButton?: boolean;
}

export function AdminTopBar({
  isOnline,
  onLogout,
  onOpenSidebar,
  showMenuButton = false,
}: AdminTopBarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-hairline-soft bg-card/90 px-3 backdrop-blur-md sm:px-4 lg:px-6">
      {showMenuButton ? (
        <button
          type="button"
          onClick={onOpenSidebar}
          className="inline-flex size-10 items-center justify-center rounded-md border border-hairline bg-card text-ink hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring xl:hidden"
          aria-label="Open navigation"
        >
          <Menu className="size-4" aria-hidden="true" />
        </button>
      ) : null}

      <a
        href={ADMIN_OVERVIEW_PATH}
        className="hidden items-center rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex xl:hidden"
        aria-label="Vendara overview"
      >
        <VendaraLogo variant="horizontal" className="h-7 max-w-[132px]" />
      </a>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          disabled
          title="Search is not available yet"
          className="inline-flex size-10 items-center justify-center rounded-md border border-hairline bg-card text-muted-text opacity-60 cursor-not-allowed"
          aria-label="Search unavailable"
        >
          <Search className="size-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          disabled
          title="Notifications are not available yet"
          className="inline-flex size-10 items-center justify-center rounded-md border border-hairline bg-card text-muted-text opacity-60 cursor-not-allowed"
          aria-label="Notifications unavailable"
        >
          <Bell className="size-4" aria-hidden="true" />
        </button>
        <ThemeMenu />
        <div className="hidden sm:block">
          <ConnectionStatus isOnline={isOnline} />
        </div>
        <button
          id="topbar-signout-btn"
          type="button"
          onClick={onLogout}
          className="inline-flex h-10 items-center gap-1.5 rounded-md border border-hairline bg-card px-3 text-xs font-medium text-ink hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <LogOut className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
