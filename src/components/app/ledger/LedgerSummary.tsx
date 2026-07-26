import type { summarizeLedgerView } from "@/lib/domain/ledger";

type LedgerSummaryMetrics = ReturnType<typeof summarizeLedgerView>;

interface LedgerSummaryProps {
  summary: LedgerSummaryMetrics;
  customerBalance: number;
  visibleCount: number;
}

export function LedgerSummary({
  summary,
  customerBalance,
  visibleCount,
}: LedgerSummaryProps) {
  return (
    <section
      className="vn-card p-5"
      aria-label="Transaction summary"
    >
      <h3 className="text-sm font-semibold text-ink font-heading">
        Transaction summary
      </h3>
      <p className="text-xs text-muted-text mt-1">
        Totals exclude voided entries. {visibleCount} entr
        {visibleCount === 1 ? "y" : "ies"} shown in the current view.
      </p>

      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-muted-text font-semibold">
            Total purchases
          </dt>
          <dd className="font-mono tabular-nums text-sm font-semibold text-ink mt-1">
            ₱{summary.totalPurchases.toFixed(2)}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-muted-text font-semibold">
            Total payments
          </dt>
          <dd className="font-mono tabular-nums text-sm font-semibold text-emerald-700 mt-1">
            ₱{summary.totalPayments.toFixed(2)}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wider text-muted-text font-semibold">
            Current balance
          </dt>
          <dd
            className={`font-mono tabular-nums text-sm font-semibold mt-1 ${
              customerBalance > 0 ? "text-destructive" : "text-ink"
            }`}
          >
            ₱{customerBalance.toFixed(2)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
