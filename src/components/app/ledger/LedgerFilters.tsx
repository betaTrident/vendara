import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { LedgerEntryTypeFilter } from "@/lib/domain/ledger";

interface LedgerFiltersProps {
  entryType: LedgerEntryTypeFilter;
  fromDate: string;
  toDate: string;
  showVoided: boolean;
  onEntryTypeChange: (value: LedgerEntryTypeFilter) => void;
  onFromDateChange: (value: string) => void;
  onToDateChange: (value: string) => void;
  onShowVoidedChange: (value: boolean) => void;
}

const TYPE_FILTERS: { id: LedgerEntryTypeFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "debt", label: "Purchases" },
  { id: "payment", label: "Payments" },
];

export function LedgerFilters({
  entryType,
  fromDate,
  toDate,
  showVoided,
  onEntryTypeChange,
  onFromDateChange,
  onToDateChange,
  onShowVoidedChange,
}: LedgerFiltersProps) {
  return (
    <div className="vn-card p-4 space-y-4">
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Ledger entry type filters"
      >
        {TYPE_FILTERS.map((filter) => (
          <Button
            key={filter.id}
            type="button"
            variant={entryType === filter.id ? "default" : "outline"}
            className="h-11 rounded-md text-xs font-semibold"
            aria-pressed={entryType === filter.id}
            onClick={() => onEntryTypeChange(filter.id)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="ledger-from-date" className="text-xs font-semibold text-ink">
            From date
          </Label>
          <Input
            id="ledger-from-date"
            type="date"
            value={fromDate}
            onChange={(event) => onFromDateChange(event.target.value)}
            className="h-11 rounded-md"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ledger-to-date" className="text-xs font-semibold text-ink">
            To date
          </Label>
          <Input
            id="ledger-to-date"
            type="date"
            value={toDate}
            onChange={(event) => onToDateChange(event.target.value)}
            className="h-11 rounded-md"
          />
        </div>
        <label className="inline-flex items-center gap-2 text-xs text-muted-text cursor-pointer min-h-11">
          <input
            type="checkbox"
            className="size-4 rounded border-hairline"
            checked={showVoided}
            onChange={(event) => onShowVoidedChange(event.target.checked)}
          />
          Show voided entries
        </label>
      </div>
    </div>
  );
}
