import { Package } from "lucide-react";

import { cn } from "@/lib/utils";

interface ProductMediaPlaceholderProps {
  className?: string;
  label?: string;
}

/** Semantic media placeholder until product photo upload is approved. */
export function ProductMediaPlaceholder({
  className,
  label = "No product photo",
}: ProductMediaPlaceholderProps) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-hairline bg-surface-soft text-muted-text",
        className,
      )}
      role="img"
      aria-label={label}
    >
      <Package className="size-4" aria-hidden="true" />
    </div>
  );
}
