import { CalendarDays, CreditCard, ShoppingBag, Wallet } from "lucide-react";

import type { summarizeLedgerView } from "@/lib/domain/ledger";

type LedgerSummaryMetrics = ReturnType<typeof summarizeLedgerView>;

interface LedgerMetricsProps {
  summary: LedgerSummaryMetrics;
  loading?: boolean;
}

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="vn-card p-4 flex flex-col justify-between min-h-[96px]">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <p className="text-[10px] text-muted-text font-semibold uppercase tracking-wider">
            {label}
          </p>
          <p className="text-xl font-semibold tracking-tight tabular-nums leading-none text-ink">
            {value}
          </p>
          {sub ? (
            <p className="text-xs text-muted-text font-medium leading-relaxed">
              {sub}
            </p>
          ) : null}
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-soft text-ink border border-hairline">
          <Icon className="size-4" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

function formatActivity(value: string | null): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function LedgerMetrics({ summary, loading }: LedgerMetricsProps) {
  if (loading) {
    return (
      <div
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-busy="true"
        aria-label="Ledger metrics loading"
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="vn-card p-4 min-h-[96px] space-y-3">
            <div className="vn-skeleton h-3 w-24" />
            <div className="vn-skeleton h-7 w-16" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Ledger metrics"
    >
      <MetricCard
        label="Total Purchases"
        value={`₱${summary.totalPurchases.toFixed(2)}`}
        sub="Credit purchases posted"
        icon={ShoppingBag}
      />
      <MetricCard
        label="Total Payments"
        value={`₱${summary.totalPayments.toFixed(2)}`}
        sub="Payments received"
        icon={CreditCard}
      />
      <MetricCard
        label="Current Balance"
        value={
          summary.currentBalance !== null
            ? `₱${summary.currentBalance.toFixed(2)}`
            : "—"
        }
        sub="After active entries"
        icon={Wallet}
      />
      <MetricCard
        label="Last Activity"
        value={formatActivity(summary.lastActivity)}
        sub="Most recent transaction date"
        icon={CalendarDays}
      />
    </div>
  );
}
