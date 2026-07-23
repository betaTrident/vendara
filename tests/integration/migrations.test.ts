import { describe, expect, it } from "vitest";

const integrationDatabaseUrl = process.env.DATABASE_URL;

describe.skipIf(!integrationDatabaseUrl)("database migrations integration", () => {
  it("applies pending migrations exactly once", async () => {
    const { neon } = await import("@neondatabase/serverless");
    const { getAppliedMigrations, runPendingMigrations } = await import(
      "../../scripts/db-migrate.mjs"
    );

    const sql = neon(integrationDatabaseUrl!);
    const before = await getAppliedMigrations(sql);
    const executed = await runPendingMigrations(sql);
    const after = await getAppliedMigrations(sql);

    expect(after.length).toBeGreaterThanOrEqual(before.length);

    const executedAgain = await runPendingMigrations(sql);
    expect(executedAgain).toHaveLength(0);

    if (executed.length > 0) {
      expect(after.length - before.length).toBe(executed.length);
    }
  });
});
