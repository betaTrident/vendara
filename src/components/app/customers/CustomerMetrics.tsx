import { Users, Wallet, CheckCircle2, TrendingUp } from "lucide-react";

import type { summarizeCustomerDirectory } from "@/lib/domain/customers";

type DirectorySummary = ReturnType<typeof summarizeCustomerDirectory>;

interface CustomerMetricsProps {
  summary: DirectorySummary;
  loading?: boolean;
}

function MetricCard({
  label,
  value,
  sub,
  icon: Icon,
  accent = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  accent?: "default" | "warning";
}) {
  return (
    <div className="vn-card p-4 flex flex-col justify-between min-h-[96px]">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <p className="text-[10px] text-muted-text font-semibold uppercase tracking-wider">
            {label}
          </p>
          <p
            className={`text-xl font-semibold tracking-tight tabular-nums leading-none ${
              accent === "warning" ? "text-destructive" : "text-ink"
            }`}
          >
            {value}
          </p>
          {sub ? (
            <p className="text-xs text-muted-text font-medium leading-relaxed line-clamp-2">
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

export function CustomerMetrics({ summary, loading }: CustomerMetricsProps) {
  if (loading) {
    return (
      <div
        className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-busy="true"
        aria-label="Customer metrics loading"
      >
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="vn-card p-4 min-h-[96px] space-y-3">
            <div className="vn-skeleton h-3 w-24" />
            <div className="vn-skeleton h-7 w-16" />
            <div className="vn-skeleton h-3 w-28" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Customer metrics"
    >
      <MetricCard
        label="Total Customers"
        value={String(summary.total)}
        sub="Active customer accounts"
        icon={Users}
      />
      <MetricCard
        label="Unpaid"
        value={String(summary.unpaid)}
        sub="Customers with outstanding balance"
        icon={Wallet}
        accent={summary.unpaid > 0 ? "warning" : "default"}
      />
      <MetricCard
        label="Fully Paid"
        value={String(summary.fullyPaid)}
        sub="Settled accounts"
        icon={CheckCircle2}
      />
      <MetricCard
        label="Highest Outstanding"
        value={
          summary.highestOutstanding
            ? `₱${summary.highestOutstanding.balance.toFixed(2)}`
            : "—"
        }
        sub={
          summary.highestOutstanding
            ? summary.highestOutstanding.name
            : "No outstanding balances"
        }
        icon={TrendingUp}
        accent={summary.highestOutstanding ? "warning" : "default"}
      />
    </div>
  );
}
