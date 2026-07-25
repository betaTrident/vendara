import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProductFiltersProps {
  search: string;
  lowMarkupOnly: boolean;
  onSearchChange: (value: string) => void;
  onLowMarkupOnlyChange: (value: boolean) => void;
}

export function ProductFilters({
  search,
  lowMarkupOnly,
  onSearchChange,
  onLowMarkupOnlyChange,
}: ProductFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1 max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-text pointer-events-none"
          aria-hidden="true"
        />
        <Input
          id="product-table-search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search products..."
          className="h-11 pl-9 pr-8 rounded-md border border-hairline bg-card text-sm"
          aria-label="Search products"
        />
        {search ? (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-text hover:text-ink min-h-11 min-w-11 inline-flex items-center justify-center"
            aria-label="Clear search"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={lowMarkupOnly ? "default" : "outline"}
          onClick={() => onLowMarkupOnlyChange(!lowMarkupOnly)}
          className="h-11 rounded-md text-xs font-semibold"
          aria-pressed={lowMarkupOnly}
        >
          Low markup
        </Button>
        <Label htmlFor="product-table-search" className="sr-only">
          Search products
        </Label>
      </div>
    </div>
  );
}
