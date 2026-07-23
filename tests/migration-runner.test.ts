import { describe, expect, it } from "vitest";

describe("db migration runner", () => {
  it("splits SQL statements without breaking dollar-quoted bodies", async () => {
    const { splitSqlStatements } = await import("../scripts/db-migrate.mjs");
    const statements = splitSqlStatements(`
      create table demo (id int);
      create or replace function demo_fn()
      returns trigger as $$
      begin
        return new;
      end;
      $$ language plpgsql;
    `);

    expect(statements).toHaveLength(2);
    expect(statements[1]).toContain("$$ language plpgsql");
  });

  it("parses ordered migration filenames", async () => {
    const { parseMigrationFilename } = await import("../scripts/db-migrate.mjs");

    expect(parseMigrationFilename("0002_ledger_integrity_and_voiding.sql")).toEqual({
      version: "0002",
      filename: "0002_ledger_integrity_and_voiding.sql",
    });
    expect(parseMigrationFilename("invalid.sql")).toBeNull();
  });

  it("creates stable checksums for migration contents", async () => {
    const { checksumForMigration } = await import("../scripts/db-migrate.mjs");
    const first = checksumForMigration("select 1;");
    const second = checksumForMigration("select 1;");
    const third = checksumForMigration("select 2;");

    expect(first).toBe(second);
    expect(first).not.toBe(third);
  });

  it("blocks production-like database targets without explicit approval", async () => {
    const { assertMigrationTargetAllowed, isProductionDatabaseTarget } = await import(
      "../scripts/db-migrate.mjs"
    );

    expect(isProductionDatabaseTarget("postgresql://user@prod-host/db")).toBe(true);

    expect(() =>
      assertMigrationTargetAllowed("postgresql://user@prod-host/db"),
    ).toThrow("Refusing to migrate");
  });

  it("allows production-like targets when the approval flag is set", async () => {
    const { assertMigrationTargetAllowed } = await import("../scripts/db-migrate.mjs");
    const previous = process.env.VENDARA_ALLOW_PRODUCTION_MIGRATE;
    process.env.VENDARA_ALLOW_PRODUCTION_MIGRATE = "1";

    expect(() =>
      assertMigrationTargetAllowed("postgresql://user@prod-host/db"),
    ).not.toThrow();

    process.env.VENDARA_ALLOW_PRODUCTION_MIGRATE = previous;
  });
});
