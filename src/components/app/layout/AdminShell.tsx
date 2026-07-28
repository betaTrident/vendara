import { type ReactNode, useState } from "react";

import { AdminSidebar } from "@/components/app/layout/AdminSidebar";
import { AdminTopBar } from "@/components/app/layout/AdminTopBar";
import { MobileBottomNavigation } from "@/components/app/layout/MobileBottomNavigation";
import { MobileHeader } from "@/components/app/layout/MobileHeader";
import { PageContainer } from "@/components/app/layout/PageContainer";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { AdminRoute } from "@/lib/admin/routes";
import { cn } from "@/lib/utils";

interface AdminShellProps {
  route: AdminRoute;
  isOnline?: boolean;
  onNavigate: (href: string) => void;
  onLogout?: () => void;
  children: ReactNode;
  /** Extra classes for main content (e.g. offline dimming). */
  mainClassName?: string;
  offlineBanner?: ReactNode;
}

export function AdminShell({
  route,
  isOnline,
  onNavigate,
  onLogout,
  children,
  mainClassName,
  offlineBanner,
}: AdminShellProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleNavigate = (href: string) => {
    setDrawerOpen(false);
    onNavigate(href);
  };

  return (
    <div className="min-h-dvh bg-background text-ink">
      <div className="flex min-h-dvh">
        <div className="hidden xl:block">
          <AdminSidebar
            route={route}
            isOnline={isOnline}
            onNavigate={handleNavigate}
            className="sticky top-0 h-dvh"
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="hidden md:block">
            <AdminTopBar
              isOnline={isOnline}
              onLogout={onLogout}
              showMenuButton
              onOpenSidebar={() => setDrawerOpen(true)}
            />
          </div>

          <MobileHeader onOpenMenu={() => setDrawerOpen(true)} onNavigate={handleNavigate} />

          {offlineBanner}

          <main
            id="main-content"
            tabIndex={-1}
            className={cn(
              "relative flex-1 pb-[calc(3.75rem+env(safe-area-inset-bottom))] md:pb-6",
              mainClassName,
            )}
          >
            <PageContainer>{children}</PageContainer>
          </main>
        </div>
      </div>

      <MobileBottomNavigation route={route} onNavigate={handleNavigate} />

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="left" className="w-[280px] p-0 sm:max-w-[280px]">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <AdminSidebar
            route={route}
            isOnline={isOnline}
            onNavigate={handleNavigate}
            className="h-full w-full border-r-0"
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
