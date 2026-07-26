import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type StatusBannerTone = "info" | "success" | "warning";

interface StatusBannerProps {
  children: ReactNode;
  tone?: StatusBannerTone;
  className?: string;
  live?: "polite" | "assertive" | "off";
}

const toneClasses: Record<StatusBannerTone, string> = {
  info: "border-hairline bg-surface-soft text-muted-text",
  success: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/40 dark:text-emerald-100",
  warning: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-100",
};

export function StatusBanner({
  children,
  tone = "info",
  className,
  live = "polite",
}: StatusBannerProps) {
  return (
    <div
      className={cn(
        "border px-4 py-2 text-center text-xs font-medium",
        toneClasses[tone],
        className,
      )}
      role="status"
      aria-live={live}
    >
      {children}
    </div>
  );
}
