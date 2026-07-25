import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface MarkupBadgeProps {
  percent: number | null;
  className?: string;
}

export function MarkupBadge({ percent, className }: MarkupBadgeProps) {
  if (percent === null) {
    return (
      <Badge
        className={cn(
          "rounded-sm text-[10px] font-semibold px-2 py-0.5 border border-hairline bg-surface-soft text-muted-text shadow-none",
          className,
        )}
      >
        —
      </Badge>
    );
  }

  const cls =
    percent < 15
      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30"
      : percent >= 40
        ? "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30"
        : "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30";

  return (
    <Badge
      className={cn(
        `rounded-sm text-[10px] font-semibold px-2 py-0.5 border ${cls} shadow-none`,
        className,
      )}
    >
      {percent >= 0 ? "+" : ""}
      {percent.toFixed(0)}%
    </Badge>
  );
}
