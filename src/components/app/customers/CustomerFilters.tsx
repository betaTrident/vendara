import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { CustomerBalanceFilter } from "@/lib/domain/customers";

interface CustomerFiltersProps {
  search: string;
  balanceFilter: CustomerBalanceFilter;
  onSearchChange: (value: string) => void;
  onBalanceFilterChange: (value: CustomerBalanceFilter) => void;
}

const FILTERS: { id: CustomerBalanceFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unpaid", label: "Unpaid" },
  { id: "paid", label: "Fully paid" },
];

export function CustomerFilters({
  search,
  balanceFilter,
  onSearchChange,
  onBalanceFilterChange,
}: CustomerFiltersProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative flex-1 max-w-md">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-text pointer-events-none"
          aria-hidden="true"
        />
        <Input
          id="customer-table-search"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search customers..."
          className="h-11 pl-9 pr-8 rounded-md border border-hairline bg-card text-sm"
          aria-label="Search customers"
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

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Customer balance filters"
      >
        {FILTERS.map((filter) => (
          <Button
            key={filter.id}
            type="button"
            variant={balanceFilter === filter.id ? "default" : "outline"}
            className="h-11 rounded-md text-xs font-semibold"
            aria-pressed={balanceFilter === filter.id}
            onClick={() => onBalanceFilterChange(filter.id)}
          >
            {filter.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
