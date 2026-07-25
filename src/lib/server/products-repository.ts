import { getSql } from "@/lib/db/client";
import { mapPriceHistoryRow, mapProductRow } from "@/lib/server/formatters";

export const listProducts = async (search?: string) => {
  const sql = getSql();

  const rows =
    search && search.trim()
      ? await sql`
          select *
          from products
          where is_active = true
            and name ilike ${`%${search.trim()}%`}
          order by name asc
        `
      : await sql`
          select *
          from products
          where is_active = true
          order by name asc
        `;

  return rows.map(mapProductRow);
};

export const getProductById = async (id: string) => {
  const sql = getSql();
  const [row] = await sql`
    select *
    from products
    where id = ${id}
      and is_active = true
    limit 1
  `;

  return row ? mapProductRow(row) : null;
};

export const createProduct = async (input: {
  name: string;
  costPrice: number;
  sellingPrice: number;
  note: string | null;
}) => {
  const sql = getSql();
  const [row] = await sql`
    insert into products (name, cost_price, selling_price, note)
    values (${input.name}, ${input.costPrice}, ${input.sellingPrice}, ${input.note})
    returning *
  `;

  return mapProductRow(row);
};

export const saveProductUpdateWithPriceHistory = async (input: {
  id: string;
  next: {
    name: string;
    costPrice: number;
    sellingPrice: number;
    note: string | null;
  };
  priceHistory: {
    productId: string;
    oldCostPrice: number;
    newCostPrice: number;
    oldSellingPrice: number;
    newSellingPrice: number;
  } | null;
}) => {
  const sql = getSql();

  const statements = [];

  if (input.priceHistory) {
    statements.push(sql`
      insert into price_history (
        product_id,
        old_cost_price,
        new_cost_price,
        old_selling_price,
        new_selling_price
      )
      values (
        ${input.priceHistory.productId},
        ${input.priceHistory.oldCostPrice},
        ${input.priceHistory.newCostPrice},
        ${input.priceHistory.oldSellingPrice},
        ${input.priceHistory.newSellingPrice}
      )
    `);
  }

  statements.push(sql`
    update products
    set
      name = ${input.next.name},
      cost_price = ${input.next.costPrice},
      selling_price = ${input.next.sellingPrice},
      note = ${input.next.note}
    where id = ${input.id}
    returning *
  `);

  const results = await sql.transaction(statements);
  const productRow = results[results.length - 1][0];

  return mapProductRow(productRow);
};

export const saveProductUpdate = async (input: {
  id: string;
  next: {
    name: string;
    costPrice: number;
    sellingPrice: number;
    note: string | null;
  };
}) => {
  const sql = getSql();
  const [row] = await sql`
    update products
    set
      name = ${input.next.name},
      cost_price = ${input.next.costPrice},
      selling_price = ${input.next.sellingPrice},
      note = ${input.next.note}
    where id = ${input.id}
    returning *
  `;

  return mapProductRow(row);
};

export const savePriceHistory = async (input: {
  productId: string;
  oldCostPrice: number;
  newCostPrice: number;
  oldSellingPrice: number;
  newSellingPrice: number;
}) => {
  const sql = getSql();
  await sql`
    insert into price_history (
      product_id,
      old_cost_price,
      new_cost_price,
      old_selling_price,
      new_selling_price
    )
    values (
      ${input.productId},
      ${input.oldCostPrice},
      ${input.newCostPrice},
      ${input.oldSellingPrice},
      ${input.newSellingPrice}
    )
  `;
};

export const listPriceHistory = async (
  productId: string,
  options: {
    since?: Date | null;
    limit?: number;
    offset?: number;
  } = {},
) => {
  const sql = getSql();
  const limit = options.limit ?? 50;
  const offset = options.offset ?? 0;
  const since = options.since ?? null;

  const countRows = since
    ? await sql`
        select count(*)::int as total
        from price_history
        where product_id = ${productId}
          and changed_at >= ${since.toISOString()}
      `
    : await sql`
        select count(*)::int as total
        from price_history
        where product_id = ${productId}
      `;

  const rows = since
    ? await sql`
        select *
        from price_history
        where product_id = ${productId}
          and changed_at >= ${since.toISOString()}
        order by changed_at desc
        limit ${limit}
        offset ${offset}
      `
    : await sql`
        select *
        from price_history
        where product_id = ${productId}
        order by changed_at desc
        limit ${limit}
        offset ${offset}
      `;

  return {
    items: rows.map(mapPriceHistoryRow),
    total: Number(countRows[0]?.total ?? 0),
  };
};

export const deleteProduct = async (id: string) => {
  const sql = getSql();
  await sql`
    update products
    set is_active = false
    where id = ${id}
  `;
};
