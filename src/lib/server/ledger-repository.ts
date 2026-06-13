import { getSql } from "@/lib/db/client";
import type { LedgerBalanceEntry } from "@/lib/domain/ledger";
import {
  mapLedgerEntryRow,
  mapLedgerItemRow,
  mapProductRow,
} from "@/lib/server/formatters";
import { calculateCustomerBalance } from "@/lib/domain/ledger";

export const getProductsByIds = async (productIds: string[]) => {
  const sql = getSql();
  const rows = await sql`
    select *
    from products
    where id = any(${productIds})
      and is_active = true
  `;

  return rows.map(mapProductRow);
};

export const createDebtEntry = async (input: {
  customerId: string;
  entryDate: string;
  note: string | null;
  totalAmount: number;
}) => {
  const sql = getSql();
  const [row] = await sql`
    insert into ledger_entries (
      customer_id,
      entry_type,
      payment_amount,
      total_amount,
      note,
      entry_date
    )
    values (
      ${input.customerId},
      'debt',
      null,
      ${input.totalAmount},
      ${input.note},
      ${input.entryDate}
    )
    returning id
  `;

  return {
    id: String(row.id),
  };
};

export const createDebtItems = async (
  ledgerEntryId: string,
  items: Array<{
    productId: string;
    productNameSnapshot: string;
    unitCostPriceSnapshot: number;
    unitSellingPriceSnapshot: number;
    quantity: number;
    lineTotal: number;
  }>,
) => {
  const sql = getSql();
  if (!items.length) {
    return;
  }

  await sql.transaction(
    items.map((item) => sql`
      insert into ledger_entry_items (
        ledger_entry_id,
        product_id,
        product_name_snapshot,
        unit_cost_price_snapshot,
        unit_selling_price_snapshot,
        quantity,
        line_total
      )
      values (
        ${ledgerEntryId},
        ${item.productId},
        ${item.productNameSnapshot},
        ${item.unitCostPriceSnapshot},
        ${item.unitSellingPriceSnapshot},
        ${item.quantity},
        ${item.lineTotal}
      )
    `),
  );
};

export const createPaymentEntry = async (input: {
  customerId: string;
  entryDate: string;
  paymentAmount: number;
  note: string | null;
}) => {
  const sql = getSql();
  await sql`
    insert into ledger_entries (
      customer_id,
      entry_type,
      payment_amount,
      total_amount,
      note,
      entry_date
    )
    values (
      ${input.customerId},
      'payment',
      ${input.paymentAmount},
      null,
      ${input.note},
      ${input.entryDate}
    )
  `;
};

export const listCustomerLedger = async (customerId: string) => {
  const sql = getSql();
  const entryRows = await sql`
    select *
    from ledger_entries
    where customer_id = ${customerId}
    order by entry_date asc, created_at asc
  `;
  const entries = entryRows.map(mapLedgerEntryRow);

  if (!entries.length) {
    return [];
  }

  const itemRows = await sql`
    select *
    from ledger_entry_items
    where ledger_entry_id = any(${entries.map((entry) => entry.id)})
    order by created_at asc
  `;
  const items = itemRows.map(mapLedgerItemRow);
  const itemsByEntryId = new Map<string, typeof items>();

  for (const item of items) {
    const group = itemsByEntryId.get(item.ledgerEntryId) ?? [];
    group.push(item);
    itemsByEntryId.set(item.ledgerEntryId, group);
  }

  let balance = 0;

  return entries
    .map((entry) => {
      const nextEntry = {
        ...entry,
        items: itemsByEntryId.get(entry.id) ?? [],
      };
      const balanceEntry: LedgerBalanceEntry =
        entry.entryType === "debt"
          ? {
              entryType: "debt",
              totalAmount: entry.totalAmount ?? 0,
            }
          : {
              entryType: "payment",
              paymentAmount: entry.paymentAmount ?? 0,
            };

      balance = calculateCustomerBalance([balanceEntry]) + balance;

      return {
        ...nextEntry,
        runningBalance: balance,
      };
    })
    .reverse();
};

export const getLedgerEntryById = async (entryId: string) => {
  const sql = getSql();
  const [row] = await sql`
    select *
    from ledger_entries
    where id = ${entryId}
    limit 1
  `;

  return row ? mapLedgerEntryRow(row) : null;
};

export const replaceDebtEntry = async (input: {
  entryId: string;
  entryDate: string;
  note: string | null;
  totalAmount: number;
  items: Array<{
    productId: string;
    productNameSnapshot: string;
    unitCostPriceSnapshot: number;
    unitSellingPriceSnapshot: number;
    quantity: number;
    lineTotal: number;
  }>;
}) => {
  const sql = getSql();

  await sql.transaction((txn) => [
    txn`
      update ledger_entries
      set
        entry_date = ${input.entryDate},
        note = ${input.note},
        total_amount = ${input.totalAmount},
        payment_amount = null
      where id = ${input.entryId}
    `,
    txn`
      delete from ledger_entry_items
      where ledger_entry_id = ${input.entryId}
    `,
    ...input.items.map((item) => txn`
      insert into ledger_entry_items (
        ledger_entry_id,
        product_id,
        product_name_snapshot,
        unit_cost_price_snapshot,
        unit_selling_price_snapshot,
        quantity,
        line_total
      )
      values (
        ${input.entryId},
        ${item.productId},
        ${item.productNameSnapshot},
        ${item.unitCostPriceSnapshot},
        ${item.unitSellingPriceSnapshot},
        ${item.quantity},
        ${item.lineTotal}
      )
    `),
  ]);
};

export const updatePaymentEntry = async (input: {
  entryId: string;
  entryDate: string;
  paymentAmount: number;
  note: string | null;
}) => {
  const sql = getSql();
  await sql`
    update ledger_entries
    set
      entry_date = ${input.entryDate},
      payment_amount = ${input.paymentAmount},
      note = ${input.note}
    where id = ${input.entryId}
  `;
};

export const deleteLedgerEntry = async (entryId: string) => {
  const sql = getSql();
  await sql`
    delete from ledger_entries
    where id = ${entryId}
  `;
};
