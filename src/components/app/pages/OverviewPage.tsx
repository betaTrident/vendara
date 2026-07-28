import {
  ArrowRight,
  CalendarDays,
  CircleDollarSign,
  CreditCard,
  Package,
  Plus,
  ShoppingBag,
  Tags,
  UserPlus,
  Users,
} from "lucide-react";

import { PageErrorState } from "@/components/app/states/PageErrorState";
import {
  formatOverviewDateLabel,
  formatOverviewGreeting,
  formatOverviewMoney,
  getBalanceSnapshotBuckets,
  overviewWeekLabel,
} from "@/lib/domain/overview";
import type { OverviewActivityItem, OwnerSummary } from "@/lib/types";

interface OverviewPageProps {
  summary: OwnerSummary | null;
  summaryLoaded: boolean;
  summaryError: string | null;
  onNavigate: (href: string) => void;
}

type Accent = "blue" | "teal" | "violet";

const statStyles: Record<Accent, { shell: string; icon: string }> = {
  blue: {
    shell:
      "border-blue-200/80 bg-gradient-to-br from-blue-50 via-white to-blue-50/50 dark:border-blue-900 dark:from-blue-950/55 dark:via-card dark:to-blue-950/25",
    icon: "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300",
  },
  teal: {
    shell:
      "border-teal-200/80 bg-gradient-to-br from-teal-50 via-white to-cyan-50/50 dark:border-teal-900 dark:from-teal-950/55 dark:via-card dark:to-cyan-950/25",
    icon: "bg-teal-100 text-teal-600 dark:bg-teal-500/15 dark:text-teal-300",
  },
  violet: {
    shell:
      "border-violet-200/80 bg-gradient-to-br from-violet-50 via-white to-purple-50/50 dark:border-violet-900 dark:from-violet-950/55 dark:via-card dark:to-purple-950/25",
    icon: "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300",
  },
};

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  accent,
  onClick,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: React.ElementType;
  accent: Accent;
  onClick: () => void;
}) {
  const styles = statStyles[accent];
  return (
    <article
      className={`grid min-h-[132px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 overflow-hidden rounded-2xl border p-4 shadow-[0_10px_28px_rgba(15,23,42,0.04)] sm:p-5 ${styles.shell}`}
    >
      <div
        className={`flex size-12 shrink-0 items-center justify-center rounded-full sm:size-14 ${styles.icon}`}
      >
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium leading-4 text-body sm:text-sm">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight tabular-nums text-ink sm:text-[28px]">
          {value}
        </p>
        <p className="mt-1 truncate text-xs font-medium text-muted-text">{detail}</p>
      </div>
      <button
        type="button"
        onClick={onClick}
        className="inline-flex size-9 items-center justify-center rounded-full border border-hairline bg-card/90 text-muted-text shadow-sm transition-[color,transform,box-shadow] hover:-translate-y-0.5 hover:text-primary hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`View ${label.toLowerCase()}`}
      >
        <ArrowRight className="size-4" aria-hidden="true" />
      </button>
    </article>
  );
}

function StatCardSkeleton() {
  return (
    <div className="vn-card grid min-h-[132px] grid-cols-[auto_1fr] items-center gap-4 p-4 sm:p-5">
      <div className="vn-skeleton size-12 rounded-full sm:size-14" />
      <div className="space-y-3">
        <div className="vn-skeleton h-4 w-32" />
        <div className="vn-skeleton h-8 w-24" />
        <div className="vn-skeleton h-3 w-36" />
      </div>
    </div>
  );
}

function activityIcon(kind: OverviewActivityItem["kind"]) {
  if (kind === "payment") return CreditCard;
  if (kind === "purchase") return ShoppingBag;
  if (kind === "price_change") return Tags;
  return UserPlus;
}

function activityTone(kind: OverviewActivityItem["kind"]): string {
  if (kind === "payment") {
    return "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300";
  }
  if (kind === "purchase") {
    return "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300";
  }
  if (kind === "price_change") {
    return "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300";
  }
  return "bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300";
}

function formatRelativeTime(iso: string): string {
  const deltaMs = Date.now() - Date.parse(iso);
  if (!Number.isFinite(deltaMs) || deltaMs < 60_000) return "Just now";
  const minutes = Math.floor(deltaMs / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function AgingDonut({ buckets }: { buckets: OwnerSummary["agingBuckets"] }) {
  const total = buckets.reduce((sum, bucket) => sum + bucket.customerCount, 0);
  const colors = ["var(--chart-4)", "var(--chart-5)", "#f97316", "var(--destructive)"];
  let offset = 0;
  const segments =
    total === 0
      ? []
      : buckets.map((bucket, index) => {
          const dash = (bucket.customerCount / total) * 100;
          const segment = { ...bucket, color: colors[index % colors.length], dash, offset };
          offset += dash;
          return segment;
        });
  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row">
      <div
        className="relative size-36 shrink-0"
        role="img"
        aria-label={`Balance status for ${total} customers`}
      >
        <svg viewBox="0 0 36 36" className="size-full -rotate-90">
          <circle cx="18" cy="18" r="14" fill="none" stroke="var(--border)" strokeWidth="4" />
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
          <p className="text-xl font-bold tabular-nums text-ink">{total}</p>
          <p className="text-[10px] font-medium text-muted-text">customers</p>
        </div>
      </div>
      <ul className="w-full space-y-3" aria-label="Balance status breakdown">
        {buckets.map((bucket, index) => (
          <li key={bucket.id} className="flex items-center justify-between gap-3 text-sm">
            <span className="inline-flex items-center gap-2 text-body">
              <span
                className="size-2.5 rounded-full"
                style={{ background: colors[index % colors.length] }}
                aria-hidden="true"
              />
              {bucket.label}
            </span>
            <span className="font-semibold tabular-nums text-ink">
              {bucket.customerCount}{" "}
              <span className="font-normal text-muted-text">
                ({total ? Math.round((bucket.customerCount / total) * 100) : 0}%)
              </span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function QuickAction({
  title,
  description,
  icon: Icon,
  tone,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ElementType;
  tone: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex min-h-24 min-w-0 flex-col items-center justify-center gap-2 rounded-xl border border-hairline bg-card p-2 text-center transition-[border-color,box-shadow,transform] hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:min-h-28 lg:flex-row lg:justify-start lg:gap-3 lg:p-3 lg:text-left"
    >
      <span className={`flex size-11 shrink-0 items-center justify-center rounded-full ${tone}`}>
        <Icon className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-semibold leading-4 text-ink sm:text-sm">{title}</span>
        <span className="mt-1 hidden text-xs leading-5 text-muted-text lg:block">
          {description}
        </span>
      </span>
    </button>
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
    new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: "Asia/Manila" })
      .formatToParts(now)
      .find((part) => part.type === "hour")?.value ?? "0",
  );
  const greeting = formatOverviewGreeting(manilaHour);
  const settledCount = summary ? summary.customerCount - summary.customersWithBalanceCount : 0;
  const balanceSnapshotBuckets = summary
    ? getBalanceSnapshotBuckets(summary.customerCount, summary.agingBuckets)
    : [];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 pb-8 sm:space-y-7">
      <section className="flex flex-col justify-between gap-4 border-b border-hairline-soft pb-5 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">Overview</h1>
          <p className="mt-1 text-sm text-muted-text">Dashboard overview and key insights.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-text">
          <CalendarDays className="size-4 text-primary" aria-hidden="true" />
          <span>{formatOverviewDateLabel(now)}</span>
          <span className="hidden sm:inline">· {overviewWeekLabel(now)}</span>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-[26px]">{greeting}</h2>
        <p className="mt-1 text-sm text-muted-text">
          Here’s what’s happening with your store today.
        </p>
      </section>
      {summaryError ? <PageErrorState message={summaryError} /> : null}

      <section className="grid gap-4 md:grid-cols-3" aria-label="Store summary">
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
              detail="Products in your price list"
              icon={Package}
              accent="blue"
              onClick={() => onNavigate("/admin/products")}
            />
            <StatCard
              label="Customers with unpaid balances"
              value={summary.customersWithBalanceCount}
              detail={`${settledCount} settled · ${summary.customerCount} total customers`}
              icon={Users}
              accent="teal"
              onClick={() => onNavigate("/admin/customers")}
            />
            <StatCard
              label="Total outstanding amount"
              value={formatOverviewMoney(summary.totalOutstanding)}
              detail={
                summary.totalOutstanding > 0
                  ? "Across customer accounts"
                  : "All accounts are settled"
              }
              icon={CircleDollarSign}
              accent="violet"
              onClick={() => onNavigate("/admin/customers")}
            />
          </>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="vn-card overflow-hidden" aria-labelledby="recent-activity-heading">
          <div className="flex items-center justify-between border-b border-hairline-soft px-5 py-4">
            <h2 id="recent-activity-heading" className="text-base font-bold text-ink">
              Recent activity
            </h2>
            <button
              type="button"
              onClick={() => onNavigate("/admin/customers")}
              className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              View customers
            </button>
          </div>
          {!summaryLoaded || !summary ? (
            <div className="space-y-3 p-5">
              <div className="vn-skeleton h-12 w-full" />
              <div className="vn-skeleton h-12 w-full" />
              <div className="vn-skeleton h-12 w-full" />
            </div>
          ) : summary.recentActivity.length === 0 ? (
            <p className="p-5 text-sm text-muted-text" role="status">
              No recent ledger, price, or customer activity yet.
            </p>
          ) : (
            <ul className="divide-y divide-hairline-soft px-5">
              {summary.recentActivity.slice(0, 5).map((item) => {
                const Icon = activityIcon(item.kind);
                return (
                  <li key={item.id} className="flex items-center gap-3 py-3">
                    <span
                      className={`flex size-9 shrink-0 items-center justify-center rounded-full ${activityTone(item.kind)}`}
                    >
                      <Icon className="size-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-ink">{item.title}</p>
                      <p className="truncate text-xs text-muted-text">{item.detail}</p>
                    </div>
                    <time
                      className="shrink-0 text-xs tabular-nums text-muted-text"
                      dateTime={item.occurredAt}
                    >
                      {formatRelativeTime(item.occurredAt)}
                    </time>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
        <section className="vn-card p-5" aria-labelledby="quick-actions-heading">
          <h2 id="quick-actions-heading" className="text-base font-bold text-ink">
            Quick actions
          </h2>
          <div className="mt-4 grid grid-cols-4 gap-2 lg:grid-cols-2 lg:gap-3">
            <QuickAction
              title="Add product"
              description="Add a new product to your price list"
              icon={Plus}
              tone="bg-blue-600 text-white"
              onClick={() => onNavigate("/admin/products")}
            />
            <QuickAction
              title="Record purchase"
              description="Log a new purchase transaction"
              icon={ShoppingBag}
              tone="bg-teal-600 text-white"
              onClick={() => onNavigate("/admin/transactions/purchase")}
            />
            <QuickAction
              title="Record payment"
              description="Record a customer payment"
              icon={CreditCard}
              tone="bg-violet-600 text-white"
              onClick={() => onNavigate("/admin/transactions/payment")}
            />
            <QuickAction
              title="View customers"
              description="Browse customer balances"
              icon={Users}
              tone="bg-amber-400 text-amber-950"
              onClick={() => onNavigate("/admin/customers")}
            />
          </div>
        </section>
      </div>

      <section className="vn-card p-5 sm:p-6" aria-labelledby="balances-snapshot-heading">
        <div className="flex flex-col gap-3 border-b border-hairline-soft pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="balances-snapshot-heading" className="text-base font-bold text-ink">
              Customer balances snapshot
            </h2>
            <p className="mt-1 text-xs text-muted-text">
              Balance aging and customers requiring follow-up.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate("/admin/customers")}
            className="w-fit rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            View all customers
          </button>
        </div>
        {!summaryLoaded || !summary ? (
          <div className="vn-skeleton mt-5 h-40 w-full" />
        ) : (
          <div className="mt-6 grid gap-7 lg:grid-cols-[1fr_1.15fr]">
            <AgingDonut buckets={balanceSnapshotBuckets} />
            <div className="border-t border-hairline-soft pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-text">
                Top outstanding balances
              </h3>
              {summary.topBalances.length === 0 ? (
                <p className="mt-4 text-sm text-muted-text" role="status">
                  All customer accounts are settled.
                </p>
              ) : (
                <ul className="mt-3 space-y-1">
                  {summary.topBalances.map((item) => (
                    <li
                      key={item.customerId}
                      className="flex items-center justify-between gap-4 rounded-lg px-2 py-2 transition-colors hover:bg-surface-soft"
                    >
                      <button
                        type="button"
                        className="truncate text-left text-sm font-medium text-ink hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        onClick={() => onNavigate(`/admin/customers?customer=${item.customerId}`)}
                      >
                        {item.customerName}
                      </button>
                      <span className="shrink-0 text-sm font-semibold tabular-nums text-destructive">
                        {formatOverviewMoney(item.balance)}
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
