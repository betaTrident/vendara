import { LogOut, ShieldCheck } from "lucide-react";

import { ConnectionStatus } from "@/components/app/ConnectionStatus";
import { VendaraLogo } from "@/components/app/branding/VendaraLogo";
import { ThemeMenu } from "@/components/app/theme/ThemeMenu";

interface AppTopBarProps {
  isAuthenticated?: boolean;
  isOnline?: boolean;
  onLogout?: () => void;
}

export const AppTopBar = ({
  isAuthenticated,
  isOnline,
  onLogout,
}: AppTopBarProps) => {
  return (
    <header
      className="sticky top-0 z-50 w-full bg-card/90 backdrop-blur-md border-b border-hairline-soft transition-all duration-300"
      style={{
        height: "56px",
      }}
    >
      <div className="mx-auto max-w-7xl h-full flex items-center justify-between px-4 sm:px-6">
        <a
          href="/admin"
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg p-1 transition-all"
          aria-label="Vendara overview"
        >
          <VendaraLogo variant="horizontal" className="h-7 max-w-[132px]" />
        </a>

        <div className="flex items-center gap-2">
          <ThemeMenu />
          {isAuthenticated ? (
            <div className="flex items-center gap-3 sm:gap-4">
              <ConnectionStatus isOnline={isOnline} />
              <button
                id="topbar-signout-btn"
                onClick={onLogout}
                className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-hairline bg-card px-3 text-xs font-medium text-ink hover:bg-surface-soft hover:border-ink transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
              >
                <LogOut className="size-3.5 shrink-0" />
                <span>Sign out</span>
              </button>
            </div>
          ) : (
            <a
              id="topbar-admin-signin-link"
              href="/admin"
              className="inline-flex h-8 items-center gap-1.5 rounded-sm bg-primary px-4 text-xs font-semibold text-primary-foreground hover:opacity-90 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
            >
              <ShieldCheck className="size-3.5 shrink-0" />
              <span>Admin sign in</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
};
