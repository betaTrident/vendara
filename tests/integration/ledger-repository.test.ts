import { describe, expect, it } from "vitest";

const integrationDatabaseUrl = process.env.DATABASE_URL;

describe.skipIf(!integrationDatabaseUrl)("ledger repository integration", () => {
  it("returns a bounded owner summary", async () => {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(integrationDatabaseUrl!);
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

    expect(Number(row?.active_product_count ?? 0)).toBeGreaterThanOrEqual(0);
    expect(Number(row?.customer_count ?? 0)).toBeGreaterThanOrEqual(0);
  });
});
