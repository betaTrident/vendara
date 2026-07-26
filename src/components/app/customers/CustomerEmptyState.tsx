import { Users } from "lucide-react";

import { Button } from "@/components/ui/button";

interface CustomerEmptyStateProps {
  hasFilters: boolean;
  search: string;
  onAdd: () => void;
  onClearFilters: () => void;
}

export function CustomerEmptyState({
  hasFilters,
  search,
  onAdd,
  onClearFilters,
}: CustomerEmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-soft border border-hairline text-muted-text">
          <Users className="size-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">No matching customers</p>
          <p className="text-xs text-muted-text mt-1">
            No customers match &ldquo;{search}&rdquo; with the current filters.
          </p>
        </div>
        <Button type="button" variant="outline" className="h-11" onClick={onClearFilters}>
          Clear filters
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-surface-soft border border-hairline text-muted-text">
        <Users className="size-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-semibold text-ink">No customers yet</p>
        <p className="text-xs text-muted-text mt-1">
          Register customers to track credit purchases and payments.
        </p>
      </div>
      <Button type="button" className="h-11" onClick={onAdd}>
        Add customer
      </Button>
    </div>
  );
}
