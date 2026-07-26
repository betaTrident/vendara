import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageLoadingStateProps {
  label?: string;
  className?: string;
  children?: ReactNode;
}

export function PageLoadingState({
  label = "Loading",
  className,
  children,
}: PageLoadingStateProps) {
  return (
    <div
      className={cn("space-y-3", className)}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">{label}</span>
      {children ?? (
        <>
          <div className="vn-skeleton h-12 w-full rounded-md" />
          <div className="vn-skeleton h-12 w-full rounded-md" />
          <div className="vn-skeleton h-12 w-full rounded-md" />
        </>
      )}
    </div>
  );
}
