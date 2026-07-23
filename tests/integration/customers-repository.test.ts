import { describe, expect, it } from "vitest";

const integrationDatabaseUrl = process.env.DATABASE_URL;

describe.skipIf(!integrationDatabaseUrl)("customers repository integration", () => {
  it("lists customers without throwing", async () => {
    const { listCustomers } = await import("@/lib/server/customers-repository");
    const customers = await listCustomers();

    expect(Array.isArray(customers)).toBe(true);
  });
});
