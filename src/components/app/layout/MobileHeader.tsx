import { Menu } from "lucide-react";

import { VendaraLogo } from "@/components/app/branding/VendaraLogo";
import { ThemeMenu } from "@/components/app/theme/ThemeMenu";
import { ADMIN_OVERVIEW_PATH } from "@/lib/admin/routes";

interface MobileHeaderProps {
  onOpenMenu?: () => void;
  onNavigate: (href: string) => void;
}

export function MobileHeader({ onOpenMenu, onNavigate }: MobileHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-hairline-soft bg-card/95 px-3 backdrop-blur-md md:hidden">
      <button
        type="button"
        onClick={onOpenMenu}
        className="inline-flex size-10 items-center justify-center rounded-md border border-hairline bg-card text-ink hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Open navigation"
      >
        <Menu className="size-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => onNavigate(ADMIN_OVERVIEW_PATH)}
        className="rounded-md p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Vendara overview"
      >
        <VendaraLogo variant="horizontal" className="h-7 max-w-[120px]" />
      </button>
      <div className="ml-auto">
        <ThemeMenu />
      </div>
    </header>
  );
}
