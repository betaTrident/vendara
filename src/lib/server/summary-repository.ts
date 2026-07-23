import { getSql } from "@/lib/db/client";
import { parseMoney } from "@/lib/domain/money";
import type { OwnerSummary } from "@/lib/types";

export const getOwnerSummary = async (): Promise<OwnerSummary> => {
  const sql = getSql();
  const [row] = await sql`
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
      coalesce(sum(case when le.voided_at is null and le.entry_type = 'debt' then le.total_amount else 0 end), 0) -
      coalesce(sum(case when le.voided_at is null and le.entry_type = 'payment' then le.payment_amount else 0 end), 0) as balance
    from customers c
    left join ledger_entries le on le.customer_id = c.id
    where c.is_active = true
    group by c.id
  `;

  let customersWithBalanceCount = 0;
  let totalOutstanding = 0;

  for (const balanceRow of balanceRows) {
    const balance = parseMoney(String(balanceRow.balance ?? 0));

    if (balance > 0) {
      customersWithBalanceCount += 1;
      totalOutstanding += balance;
    }
  }

  return {
    activeProductCount: Number(row?.active_product_count ?? 0),
    customerCount: Number(row?.customer_count ?? 0),
    customersWithBalanceCount,
    totalOutstanding: parseMoney(totalOutstanding),
  };
};
