import { describe, expect, it } from "vitest";

const integrationDatabaseUrl = process.env.DATABASE_URL;

describe.skipIf(!integrationDatabaseUrl)("products repository integration", () => {
  it("lists products without throwing", async () => {
    const { listProducts } = await import("@/lib/server/products-repository");
    const products = await listProducts();

    expect(Array.isArray(products)).toBe(true);
  });
});
