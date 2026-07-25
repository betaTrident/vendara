import { Package, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ProductEmptyStateProps {
  hasFilters: boolean;
  search: string;
  onAdd: () => void;
  onClearFilters: () => void;
}

export function ProductEmptyState({
  hasFilters,
  search,
  onAdd,
  onClearFilters,
}: ProductEmptyStateProps) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center gap-3 py-14 text-center px-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-surface-soft border border-hairline text-muted-text">
          <Package className="size-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold text-ink">No matching products</p>
          <p className="text-xs text-muted-text mt-1">
            {search
              ? `Nothing matches “${search}”.`
              : "No products match the current filters."}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onClearFilters}
          className="h-11 rounded-md text-xs font-semibold"
        >
          Clear filters
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 py-14 text-center px-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-surface-soft border border-hairline text-muted-text">
        <Package className="size-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-semibold text-ink">No products yet</p>
        <p className="text-xs text-muted-text mt-1">
          Add your first catalog item to track cost, selling price, and markup.
        </p>
      </div>
      <Button
        type="button"
        onClick={onAdd}
        className="h-11 rounded-md text-xs font-semibold"
      >
        <Plus className="size-3.5 mr-1.5" aria-hidden="true" />
        Add first product
      </Button>
    </div>
  );
}
