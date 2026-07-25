import { getSql } from "@/lib/db/client";
import { parseMoney } from "@/lib/domain/money";
import {
  AGING_BUCKET_DEFS,
  classifyAgingBucket,
  daysBetweenDates,
  emptyAgingCounts,
} from "@/lib/domain/overview";
import type {
  OverviewActivityItem,
  OverviewActivityKind,
  OverviewBalanceItem,
  OwnerSummary,
} from "@/lib/types";

const ACTIVITY_LIMIT = 8;
const TOP_BALANCES_LIMIT = 5;

function todayUtcDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function toIsoTimestamp(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === "string" && value.length > 0) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }
  return new Date(0).toISOString();
}

function formatPeso(amount: number): string {
  return `₱${amount.toFixed(2)}`;
}

export const getOwnerSummary = async (): Promise<OwnerSummary> => {
  const sql = getSql();
  const today = todayUtcDate();

  const [countsRow] = await sql`
    select
      (
        select count(*)::int
        from products
        where is_active = true
      ) as active_product_count,
      (
        select count(*)::int
        from customers
        where is_active = true
      ) as customer_count
  `;

  const balanceRows = await sql`
    select
      c.id,
      c.name,
      coalesce(sum(case when le.voided_at is null and le.entry_type = 'debt' then le.total_amount else 0 end), 0) -
      coalesce(sum(case when le.voided_at is null and le.entry_type = 'payment' then le.payment_amount else 0 end), 0) as balance,
      min(
        case
          when le.voided_at is null and le.entry_type = 'debt' then le.entry_date
          else null
        end
      ) as oldest_debt_date
    from customers c
    left join ledger_entries le on le.customer_id = c.id
    where c.is_active = true
    group by c.id, c.name
  `;

  let customersWithBalanceCount = 0;
  let totalOutstanding = 0;
  const agingCounts = emptyAgingCounts();
  const positiveBalances: OverviewBalanceItem[] = [];

  for (const balanceRow of balanceRows) {
    const balance = parseMoney(String(balanceRow.balance ?? 0));

    if (balance > 0) {
      customersWithBalanceCount += 1;
      totalOutstanding += balance;
      positiveBalances.push({
        customerId: String(balanceRow.id),
        customerName: String(balanceRow.name ?? "Customer"),
        balance,
      });

      const oldest =
        balanceRow.oldest_debt_date != null
          ? String(balanceRow.oldest_debt_date).slice(0, 10)
          : today;
      const days = daysBetweenDates(oldest, today);
      const bucket = classifyAgingBucket(days);
      agingCounts[bucket] += 1;
    }
  }

  positiveBalances.sort((a, b) => b.balance - a.balance);
  const topBalances = positiveBalances.slice(0, TOP_BALANCES_LIMIT);

  const ledgerActivityRows = await sql`
    select
      le.id,
      le.entry_type,
      le.total_amount,
      le.payment_amount,
      le.entry_date,
      le.created_at,
      c.name as customer_name
    from ledger_entries le
    inner join customers c on c.id = le.customer_id
    where le.voided_at is null
    order by le.created_at desc
    limit ${ACTIVITY_LIMIT}
  `;

  const priceActivityRows = await sql`
    select
      ph.id,
      ph.changed_at,
      p.name as product_name,
      ph.old_selling_price,
      ph.new_selling_price
    from price_history ph
    inner join products p on p.id = ph.product_id
    order by ph.changed_at desc
    limit ${ACTIVITY_LIMIT}
  `;

  const customerActivityRows = await sql`
    select
      c.id,
      c.name,
      c.created_at
    from customers c
    where c.is_active = true
    order by c.created_at desc
    limit ${ACTIVITY_LIMIT}
  `;

  const recentActivity: OverviewActivityItem[] = [];

  for (const row of ledgerActivityRows) {
    const entryType = String(row.entry_type);
    const kind: OverviewActivityKind =
      entryType === "payment" ? "payment" : "purchase";
    const amount =
      kind === "payment"
        ? parseMoney(String(row.payment_amount ?? 0))
        : parseMoney(String(row.total_amount ?? 0));
    recentActivity.push({
      id: `ledger:${String(row.id)}`,
      kind,
      title: kind === "payment" ? "Payment recorded" : "Purchase recorded",
      detail: `${String(row.customer_name)} · ${formatPeso(amount)}`,
      occurredAt: toIsoTimestamp(row.created_at ?? row.entry_date),
    });
  }

  for (const row of priceActivityRows) {
    recentActivity.push({
      id: `price:${String(row.id)}`,
      kind: "price_change",
      title: "Price updated",
      detail: `${String(row.product_name)} · ${formatPeso(parseMoney(String(row.old_selling_price ?? 0)))} → ${formatPeso(parseMoney(String(row.new_selling_price ?? 0)))}`,
      occurredAt: toIsoTimestamp(row.changed_at),
    });
  }

  for (const row of customerActivityRows) {
    recentActivity.push({
      id: `customer:${String(row.id)}`,
      kind: "customer_created",
      title: "Customer added",
      detail: String(row.name),
      occurredAt: toIsoTimestamp(row.created_at),
    });
  }

  recentActivity.sort(
    (a, b) => Date.parse(b.occurredAt) - Date.parse(a.occurredAt),
  );

  return {
    activeProductCount: Number(countsRow?.active_product_count ?? 0),
    customerCount: Number(countsRow?.customer_count ?? 0),
    customersWithBalanceCount,
    totalOutstanding: parseMoney(totalOutstanding),
    recentActivity: recentActivity.slice(0, ACTIVITY_LIMIT),
    topBalances,
    agingBuckets: AGING_BUCKET_DEFS.map((def) => ({
      id: def.id,
      label: def.label,
      customerCount: agingCounts[def.id],
    })),
  };
};
