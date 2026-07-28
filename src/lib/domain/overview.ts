/**
 * Pure helpers for overview greeting and balance aging classification.
 * Aging uses days since each customer's oldest non-voided debt while balance > 0.
 */

export type AgingBucketId = "current" | "late-1-7" | "late-8-30" | "late-30-plus";

export const AGING_BUCKET_DEFS: Array<{
  id: AgingBucketId;
  label: string;
}> = [
  { id: "current", label: "Current" },
  { id: "late-1-7", label: "1–7 days late" },
  { id: "late-8-30", label: "8–30 days late" },
  { id: "late-30-plus", label: "Over 30 days" },
];

export function classifyAgingBucket(daysOutstanding: number): AgingBucketId {
  if (daysOutstanding <= 0) {
    return "current";
  }
  if (daysOutstanding <= 7) {
    return "late-1-7";
  }
  if (daysOutstanding <= 30) {
    return "late-8-30";
  }
  return "late-30-plus";
}

/** Whole calendar days between YYYY-MM-DD (or ISO) strings using UTC dates. */
export function daysBetweenDates(from: string, to: string): number {
  const start = Date.parse(`${from.slice(0, 10)}T00:00:00.000Z`);
  const end = Date.parse(`${to.slice(0, 10)}T00:00:00.000Z`);
  if (!Number.isFinite(start) || !Number.isFinite(end)) {
    return 0;
  }
  return Math.max(0, Math.round((end - start) / 86_400_000));
}

export function emptyAgingCounts(): Record<AgingBucketId, number> {
  return {
    current: 0,
    "late-1-7": 0,
    "late-8-30": 0,
    "late-30-plus": 0,
  };
}

export function getBalanceSnapshotBuckets(
  customerCount: number,
  agingBuckets: Array<{
    id: AgingBucketId;
    label: string;
    customerCount: number;
  }>,
) {
  const normalizedCustomerCount = Math.max(0, customerCount);
  const outstandingCustomerCount = agingBuckets.reduce(
    (total, bucket) => total + Math.max(0, bucket.customerCount),
    0,
  );
  const settledCustomerCount = Math.max(0, normalizedCustomerCount - outstandingCustomerCount);

  return agingBuckets.map((bucket) =>
    bucket.id === "current"
      ? {
          ...bucket,
          label: "No overdue balance",
          customerCount: bucket.customerCount + settledCustomerCount,
        }
      : { ...bucket },
  );
}

export function formatOverviewMoney(amount: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatManilaDateKey(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Manila",
  }).formatToParts(date);
  const values = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

export function formatOverviewGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) {
    return "Magandang umaga";
  }
  if (hour >= 12 && hour < 18) {
    return "Magandang hapon";
  }
  return "Magandang gabi";
}

export function overviewWeekLabel(date: Date): string {
  const target = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const dayNum = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((target.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7);
  return `Week ${week}`;
}

export function formatOverviewDateLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-PH", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Manila",
  }).format(date);
}
