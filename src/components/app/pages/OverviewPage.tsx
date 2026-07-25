import {
  AlertCircle,
  CreditCard,
  Package,
  Plus,
  ShoppingBag,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/app/layout/PageHeader";
import {
  formatOverviewDateLabel,
  formatOverviewGreeting,
  overviewWeekLabel,
} from "@/lib/domain/overview";
import type { OwnerSummary, OverviewActivityItem } from "@/lib/types";

interface OverviewPageProps {
  summary: OwnerSummary | null;
  summaryLoaded: boolean;
  summaryError: string | null;
  onNavigate: (href: string) => void;
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  accent?: "default" | "error";
}

const StatCard = ({
  label,
  value,
  sub,
  icon: Icon,
  accent = "default",
}: StatCardProps) => (
  <div className="vn-card p-4 sm:p-5 flex flex-col justify-between min-h-[108px]">
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-1.5 min-w-0">
        <p className="text-[10px] text-muted-text font-semibold uppercase tracking-wider font-sans">
          {label}
        </p>
        <div className="flex items-center gap-2">
          <p
            className={`text-xl sm:text-2xl font-semibold tracking-tight tabular-nums leading-none ${
              accent === "error" ? "text-destructive" : "text-ink"
            }`}
          >
            {value}
          </p>
          {accent === "error" ? (
            <span className="vn-pulse-dot" aria-label="Outstanding debt alert" />
          ) : null}
        </div>
        {sub ? (
          <p className="text-xs text-muted-text font-medium leading-relaxed mt-1">
            {sub}
          </p>
        ) : null}
      </div>
      <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-md bg-surface-soft text-ink border border-hairline">
        <Icon className="size-4 sm:size-5" aria-hidden="true" />
      </div>
    </div>
  </div>
);

const StatCardSkeleton = () => (
  <div className="vn-card p-4 sm:p-5 space-y-4 min-h-[108px]">
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-3 flex-1">
        <div className="vn-skeleton h-3.5 w-24" />
        <div className="vn-skeleton h-7 w-20" />
        <div className="vn-skeleton h-3 w-28" />
      </div>
      <div className="vn-skeleton h-10 w-10 rounded-md" />
    </div>
  </div>
);

function activityTone(kind: OverviewActivityItem["kind"]): string {
  switch (kind) {
    case "payment":
      return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400";
    case "purchase":
      return "bg-primary/10 text-primary";
    case "price_change":
      return "bg-amber-500/15 text-amber-700 dark:text-amber-400";
    default:
      return "bg-surface-soft text-muted-text";
  }
}

function formatRelativeTime(iso: string): string {
  const deltaMs = Date.now() - Date.parse(iso);
  if (!Number.isFinite(deltaMs) || deltaMs < 0) {
    return "Just now";
  }
  const minutes = Math.floor(deltaMs / 60_000);
  if (minutes < 1) {
    return "Just now";
  }
  if (minutes < 60) {
    return `${minutes}m ago`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function AgingDonut({
  buckets,
}: {
  buckets: OwnerSummary["agingBuckets"];
}) {
  const total = buckets.reduce((sum, bucket) => sum + bucket.customerCount, 0);
  const colors = [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
  ];

  let offset = 0;
  const segments =
    total === 0
      ? []
      : buckets.map((bucket, index) => {
          const value = (bucket.customerCount / total) * 100;
          const segment = {
            ...bucket,
            color: colors[index % colors.length],
            dash: value,
            offset,
          };
          offset += value;
          return segment;
        });

  return (
    <div className="flex flex-col sm:flex-row items-center gap-5">
      <div className="relative size-36 shrink-0" aria-hidden={total === 0}>
        <svg viewBox="0 0 36 36" className="size-full -rotate-90">
          <circle
            cx="18"
            cy="18"
            r="14"
            fill="none"
            stroke="var(--border)"
            strokeWidth="4"
          />
          {segments.map((segment) => (
            <circle
              key={segment.id}
              cx="18"
              cy="18"
              r="14"
              fill="none"
              stroke={segment.color}
              strokeWidth="4"
              strokeDasharray={`${segment.dash} ${100 - segment.dash}`}
              strokeDashoffset={-segment.offset}
            />
          ))}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-lg font-semibold tabular-nums text-ink">{total}</p>
          <p className="text-[10px] uppercase tracking-wide text-muted-text">
            with balance
          </p>
        </div>
      </div>

      <ul className="w-full space-y-2" aria-label="Aging breakdown">
        {buckets.map((bucket, index) => (
          <li
            key={bucket.id}
            className="flex items-center justify-between gap-3 text-sm"
          >
            <span className="inline-flex items-center gap-2 text-muted-text">
              <span
                className="size-2.5 rounded-full"
                style={{ background: colors[index % colors.length] }}
                aria-hidden="true"
              />
              {bucket.label}
            </span>
            <span className="font-semibold tabular-nums text-ink">
              {bucket.customerCount}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function OverviewPage({
  summary,
  summaryLoaded,
  summaryError,
  onNavigate,
}: OverviewPageProps) {
  const now = new Date();
  const manilaHour = Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      hourCycle: "h23",
      timeZone: "Asia/Manila",
    })
      .formatToParts(now)
      .find((part) => part.type === "hour")?.value ?? "0",
  );
  const greeting = formatOverviewGreeting(manilaHour);
  const settledCount = summary
    ? summary.customerCount - summary.customersWithBalanceCount
    : 0;

  return (
    <div className="space-y-5 sm:space-y-6">
      <PageHeader
        title="Overview"
        description="Dashboard overview and key insights."
        actions={
          <Badge className="rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] px-2.5 py-0.5 font-semibold">
            Owner
          </Badge>
        }
      />

      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-ink font-heading text-balance">
          {greeting}
        </h2>
        <p className="text-sm text-muted-text">
          {formatOverviewDateLabel(now)} · {overviewWeekLabel(now)}
        </p>
      </div>

      {summaryError ? (
        <p className="text-sm text-destructive" role="alert">
          {summaryError}
        </p>
      ) : null}

      <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
        {!summaryLoaded || !summary ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              label="Active products"
              value={summary.activeProductCount}
              sub="in your price list"
              icon={Package}
            />
            <StatCard
              label="Customers with unpaid balances"
              value={summary.customersWithBalanceCount}
              sub={`${settledCount} settled · ${summary.customerCount} total`}
              icon={Users}
            />
            <StatCard
              label="Total outstanding"
              value={`₱${summary.totalOutstanding.toFixed(2)}`}
              sub={
                summary.totalOutstanding > 0
                  ? "across customer accounts"
                  : "all accounts settled"
              }
              icon={AlertCircle}
              accent={summary.totalOutstanding > 0 ? "error" : "default"}
            />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="vn-card p-4 sm:p-5 space-y-4" aria-labelledby="recent-activity-heading">
          <h2
            id="recent-activity-heading"
            className="text-sm font-semibold text-ink"
          >
            Recent activity
          </h2>
          {!summaryLoaded || !summary ? (
            <div className="space-y-3">
              <div className="vn-skeleton h-12 w-full" />
              <div className="vn-skeleton h-12 w-full" />
              <div className="vn-skeleton h-12 w-full" />
            </div>
          ) : summary.recentActivity.length === 0 ? (
            <p className="text-sm text-muted-text" role="status">
              No recent ledger, price, or customer activity yet.
            </p>
          ) : (
            <ul className="space-y-3">
              {summary.recentActivity.map((item) => (
                <li key={item.id} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-[10px] font-bold uppercase ${activityTone(item.kind)}`}
                  >
                    {item.kind === "payment"
                      ? "Pay"
                      : item.kind === "purchase"
                        ? "Buy"
                        : item.kind === "price_change"
                          ? "Price"
                          : "New"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{item.title}</p>
                    <p className="text-xs text-muted-text truncate">
                      {item.detail}
                    </p>
                  </div>
                  <time
                    className="shrink-0 text-[11px] text-muted-text tabular-nums"
                    dateTime={item.occurredAt}
                  >
                    {formatRelativeTime(item.occurredAt)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section
          className="vn-card p-4 sm:p-5 space-y-4"
          aria-labelledby="quick-actions-heading"
        >
          <h2
            id="quick-actions-heading"
            className="text-sm font-semibold text-ink"
          >
            Quick actions
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => onNavigate("/admin/products")}
              className="flex min-h-20 flex-col items-start justify-between rounded-md bg-primary px-3 py-3 text-left text-primary-foreground hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Plus className="size-4" aria-hidden="true" />
              <span className="text-sm font-semibold">Add product</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate("/admin/transactions/purchase")}
              className="flex min-h-20 flex-col items-start justify-between rounded-md bg-teal-600 px-3 py-3 text-left text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ShoppingBag className="size-4" aria-hidden="true" />
              <span className="text-sm font-semibold">Record purchase</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate("/admin/transactions/payment")}
              className="flex min-h-20 flex-col items-start justify-between rounded-md bg-violet-600 px-3 py-3 text-left text-white hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <CreditCard className="size-4" aria-hidden="true" />
              <span className="text-sm font-semibold">Record payment</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate("/admin/customers")}
              className="flex min-h-20 flex-col items-start justify-between rounded-md bg-amber-500 px-3 py-3 text-left text-ink hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Users className="size-4" aria-hidden="true" />
              <span className="text-sm font-semibold">View customers</span>
            </button>
          </div>
        </section>
      </div>

      <section
        className="vn-card p-4 sm:p-5 space-y-5"
        aria-labelledby="balances-snapshot-heading"
      >
        <h2
          id="balances-snapshot-heading"
          className="text-sm font-semibold text-ink"
        >
          Customer balances snapshot
        </h2>

        {!summaryLoaded || !summary ? (
          <div className="vn-skeleton h-40 w-full" />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            <AgingDonut buckets={summary.agingBuckets} />

            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-text">
                Top outstanding balances
              </h3>
              {summary.topBalances.length === 0 ? (
                <p className="text-sm text-muted-text" role="status">
                  All customer accounts are settled.
                </p>
              ) : (
                <ul className="space-y-2" aria-label="Top outstanding balances">
                  {summary.topBalances.map((item) => (
                    <li
                      key={item.customerId}
                      className="flex items-center justify-between gap-3 rounded-md border border-hairline px-3 py-2.5"
                    >
                      <button
                        type="button"
                        className="truncate text-left text-sm font-medium text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                        onClick={() =>
                          onNavigate(
                            `/admin/customers?customer=${item.customerId}`,
                          )
                        }
                      >
                        {item.customerName}
                      </button>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-destructive">
                        ₱{item.balance.toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
