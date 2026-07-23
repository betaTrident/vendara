import { getSql } from "@/lib/db/client";
import type { LedgerBalanceEntry } from "@/lib/domain/ledger";
import { parseMoney, toMoneyString } from "@/lib/domain/money";
import {
  mapLedgerEntryRow,
  mapLedgerItemRow,
  mapProductRow,
} from "@/lib/server/formatters";
import { calculateCustomerBalance } from "@/lib/domain/ledger";

export class IdempotencyConflictError extends Error {
  constructor() {
    super("Idempotency key was already used with different data.");
    this.name = "IdempotencyConflictError";
  }
}

export class PaymentExceedsBalanceError extends Error {
  constructor() {
    super("Payment amount exceeds the customer's outstanding balance.");
    this.name = "PaymentExceedsBalanceError";
  }
}

export class LedgerEntryAlreadyVoidedError extends Error {
  constructor() {
    super("Ledger entry has already been voided.");
    this.name = "LedgerEntryAlreadyVoidedError";
  }
}

const isUniqueViolation = (error: unknown) => {
  if (typeof error === "object" && error !== null && "code" in error) {
    return String((error as { code?: string }).code) === "23505";
  }

  return error instanceof Error && /duplicate key/i.test(error.message);
};

const buildDebtFingerprint = (input: {
  customerId: string;
  entryDate: string;
  note: string | null;
  totalAmount: number;
  items: Array<{
    productId: string;
    quantity: number;
    lineTotal: number;
  }>;
}) =>
  JSON.stringify({
    customerId: input.customerId,
    entryDate: input.entryDate,
    note: input.note,
    totalAmount: toMoneyString(input.totalAmount),
    items: input.items
      .map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        lineTotal: toMoneyString(item.lineTotal),
      }))
      .sort((left, right) => left.productId.localeCompare(right.productId)),
  });

const buildPaymentFingerprint = (input: {
  customerId: string;
  entryDate: string;
  note: string | null;
  paymentAmount: number;
}) =>
  JSON.stringify({
    customerId: input.customerId,
    entryDate: input.entryDate,
    note: input.note,
    paymentAmount: toMoneyString(input.paymentAmount),
  });

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

export const getCustomerOutstandingBalance = async (customerId: string) => {
  const sql = getSql();
  const [row] = await sql`
    select
      coalesce(sum(case when le.entry_type = 'debt' then le.total_amount else 0 end), 0) -
      coalesce(sum(case when le.entry_type = 'payment' then le.payment_amount else 0 end), 0) as balance
    from ledger_entries le
    where le.customer_id = ${customerId}
      and le.voided_at is null
  `;

  return parseMoney(String(row?.balance ?? 0));
};

const getLedgerEntryItems = async (entryId: string) => {
  const sql = getSql();
  const itemRows = await sql`
    select *
    from ledger_entry_items
    where ledger_entry_id = ${entryId}
    order by created_at asc
  `;

  return itemRows.map(mapLedgerItemRow);
};

const getLedgerEntryByIdempotencyKey = async (idempotencyKey: string) => {
  const sql = getSql();
  const [row] = await sql`
    select *
    from ledger_entries
    where idempotency_key = ${idempotencyKey}
    limit 1
  `;

  if (!row) {
    return null;
  }

  const entry = mapLedgerEntryRow(row);
  entry.items = await getLedgerEntryItems(entry.id);
  return entry;
};

export const createDebtEntryWithItems = async (input: {
  customerId: string;
  entryDate: string;
  note: string | null;
  totalAmount: number;
  idempotencyKey: string;
  items: Array<{
    productId: string;
    productNameSnapshot: string;
    unitCostPriceSnapshot: number;
    unitSellingPriceSnapshot: number;
    quantity: number;
    lineTotal: number;
  }>;
}) => {
  const fingerprint = buildDebtFingerprint({
    customerId: input.customerId,
    entryDate: input.entryDate,
    note: input.note,
    totalAmount: input.totalAmount,
    items: input.items,
  });
  const sql = getSql();
  const entryId = crypto.randomUUID();

  try {
    await sql.transaction([
      sql`
        insert into ledger_entries (
          id,
          customer_id,
          entry_type,
          payment_amount,
          total_amount,
          note,
          entry_date,
          idempotency_key
        )
        values (
          ${entryId},
          ${input.customerId},
          'debt',
          null,
          ${input.totalAmount},
          ${input.note},
          ${input.entryDate},
          ${input.idempotencyKey}
        )
        returning id
      `,
      ...input.items.map((item) => sql`
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
          ${entryId},
          ${item.productId},
          ${item.productNameSnapshot},
          ${item.unitCostPriceSnapshot},
          ${item.unitSellingPriceSnapshot},
          ${item.quantity},
          ${item.lineTotal}
        )
      `),
    ]);
  } catch (error) {
    if (!isUniqueViolation(error)) {
      throw error;
    }

    const existing = await getLedgerEntryByIdempotencyKey(input.idempotencyKey);

    if (!existing) {
      throw error;
    }

    const existingFingerprint = buildDebtFingerprint({
      customerId: existing.customerId,
      entryDate: existing.entryDate,
      note: existing.note,
      totalAmount: existing.totalAmount ?? 0,
      items: existing.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        lineTotal: item.lineTotal,
      })),
    });

    if (existingFingerprint !== fingerprint) {
      throw new IdempotencyConflictError();
    }

    return { id: existing.id };
  }

  return { id: entryId };
};

export const createPaymentEntry = async (input: {
  customerId: string;
  entryDate: string;
  paymentAmount: number;
  note: string | null;
  idempotencyKey: string;
}) => {
  const fingerprint = buildPaymentFingerprint(input);
  const sql = getSql();
  const entryId = crypto.randomUUID();

  try {
    await sql`
      insert into ledger_entries (
        id,
        customer_id,
        entry_type,
        payment_amount,
        total_amount,
        note,
        entry_date,
        idempotency_key
      )
      values (
        ${entryId},
        ${input.customerId},
        'payment',
        ${input.paymentAmount},
        null,
        ${input.note},
        ${input.entryDate},
        ${input.idempotencyKey}
      )
    `;

    return { id: entryId };
  } catch (error) {
    if (!isUniqueViolation(error)) {
      throw error;
    }

    const existing = await getLedgerEntryByIdempotencyKey(input.idempotencyKey);

    if (!existing) {
      throw error;
    }

    const existingFingerprint = buildPaymentFingerprint({
      customerId: existing.customerId,
      entryDate: existing.entryDate,
      note: existing.note,
      paymentAmount: existing.paymentAmount ?? 0,
    });

    if (existingFingerprint !== fingerprint) {
      throw new IdempotencyConflictError();
    }

    return { id: existing.id };
  }
};

export const voidLedgerEntry = async (input: {
  entryId: string;
  voidedBy: string;
  reason: string;
}) => {
  const sql = getSql();
  const entry = await getLedgerEntryById(input.entryId);

  if (!entry) {
    return null;
  }

  if (entry.voidedAt) {
    throw new LedgerEntryAlreadyVoidedError();
  }

  const [updated] = await sql`
    update ledger_entries
    set
      voided_at = now(),
      voided_by = ${input.voidedBy},
      void_reason = ${input.reason}
    where id = ${input.entryId}
      and voided_at is null
    returning customer_id
  `;

  if (!updated) {
    throw new LedgerEntryAlreadyVoidedError();
  }

  const balance = await getCustomerOutstandingBalance(String(updated.customer_id));

  return {
    customerId: String(updated.customer_id),
    balance,
  };
};

export const listCustomerLedger = async (
  customerId: string,
  options?: { includeVoided?: boolean },
) => {
  const sql = getSql();
  const entryRows =
    options?.includeVoided === true
      ? await sql`
          select *
          from ledger_entries
          where customer_id = ${customerId}
          order by entry_date asc, created_at asc
        `
      : await sql`
          select *
          from ledger_entries
          where customer_id = ${customerId}
            and voided_at is null
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
      const balanceEntry: LedgerBalanceEntry | null = entry.voidedAt
        ? null
        : entry.entryType === "debt"
          ? {
              entryType: "debt",
              totalAmount: entry.totalAmount ?? 0,
            }
          : {
              entryType: "payment",
              paymentAmount: entry.paymentAmount ?? 0,
            };

      if (balanceEntry) {
        balance = calculateCustomerBalance([balanceEntry]) + balance;
      }

      return {
        ...nextEntry,
        runningBalance: entry.voidedAt ? balance : balance,
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

  if (!row) {
    return null;
  }

  const entry = mapLedgerEntryRow(row);
  entry.items = await getLedgerEntryItems(entry.id);
  return entry;
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
