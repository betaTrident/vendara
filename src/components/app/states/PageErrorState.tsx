import { cn } from "@/lib/utils";

interface PageErrorStateProps {
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function PageErrorState({
  message,
  onRetry,
  retryLabel = "Try again",
  className,
}: PageErrorStateProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3",
        className,
      )}
      role="alert"
    >
      <p className="text-sm text-destructive">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 inline-flex h-9 items-center rounded-md border border-hairline bg-card px-3 text-xs font-semibold text-ink hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}
