import { getSql } from "@/lib/db/client";
import { mapCustomerRow } from "@/lib/server/formatters";

export const listCustomers = async (search?: string) => {
  const sql = getSql();
  const rows =
    search && search.trim()
      ? await sql`
          select
            c.*,
            coalesce(sum(case when le.entry_type = 'debt' then le.total_amount else 0 end), 0) -
            coalesce(sum(case when le.entry_type = 'payment' then le.payment_amount else 0 end), 0) as balance
          from customers c
          left join ledger_entries le on le.customer_id = c.id
          where c.is_active = true
            and c.name ilike ${`%${search.trim()}%`}
          group by c.id
          order by c.name asc
        `
      : await sql`
          select
            c.*,
            coalesce(sum(case when le.entry_type = 'debt' then le.total_amount else 0 end), 0) -
            coalesce(sum(case when le.entry_type = 'payment' then le.payment_amount else 0 end), 0) as balance
          from customers c
          left join ledger_entries le on le.customer_id = c.id
          where c.is_active = true
          group by c.id
          order by c.name asc
        `;

  return rows.map(mapCustomerRow);
};

export const getCustomerById = async (id: string) => {
  const sql = getSql();
  const [row] = await sql`
    select
      c.*,
      coalesce(sum(case when le.entry_type = 'debt' then le.total_amount else 0 end), 0) -
      coalesce(sum(case when le.entry_type = 'payment' then le.payment_amount else 0 end), 0) as balance
    from customers c
    left join ledger_entries le on le.customer_id = c.id
    where c.id = ${id}
      and c.is_active = true
    group by c.id
    limit 1
  `;

  return row ? mapCustomerRow(row) : null;
};

export const createCustomer = async (input: {
  name: string;
  note: string | null;
}) => {
  const sql = getSql();
  const [row] = await sql`
    insert into customers (name, note)
    values (${input.name}, ${input.note})
    returning *, 0 as balance
  `;

  return mapCustomerRow(row);
};

export const updateCustomer = async (input: {
  id: string;
  name: string;
  note: string | null;
}) => {
  const sql = getSql();
  const [row] = await sql`
    update customers
    set
      name = ${input.name},
      note = ${input.note}
    where id = ${input.id}
    returning *, 0 as balance
  `;

  return mapCustomerRow(row);
};

export const deleteCustomer = async (id: string) => {
  const sql = getSql();
  await sql`
    update customers
    set is_active = false
    where id = ${id}
  `;
};
