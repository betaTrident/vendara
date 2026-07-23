import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { neon } from "@neondatabase/serverless";

const MIGRATION_FILE_PATTERN = /^(\d{4})_[\w-]+\.sql$/;
const PRODUCTION_GUARD_ENV = "VENDARA_ALLOW_PRODUCTION_MIGRATE";

export const splitSqlStatements = (input) => {
  const statements = [];
  let current = "";
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inDollarQuote = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const nextTwo = input.slice(index, index + 2);

    if (!inSingleQuote && !inDoubleQuote && nextTwo === "$$") {
      inDollarQuote = !inDollarQuote;
      current += nextTwo;
      index += 1;
      continue;
    }

    if (!inDoubleQuote && !inDollarQuote && char === "'" && input[index - 1] !== "\\") {
      inSingleQuote = !inSingleQuote;
      current += char;
      continue;
    }

    if (!inSingleQuote && !inDollarQuote && char === '"' && input[index - 1] !== "\\") {
      inDoubleQuote = !inDoubleQuote;
      current += char;
      continue;
    }

    if (!inSingleQuote && !inDoubleQuote && !inDollarQuote && char === ";") {
      const statement = current.trim();

      if (statement) {
        statements.push(statement);
      }

      current = "";
      continue;
    }

    current += char;
  }

  const trailingStatement = current.trim();

  if (trailingStatement) {
    statements.push(trailingStatement);
  }

  return statements;
};

export const checksumForMigration = (sql) =>
  createHash("sha256").update(sql, "utf8").digest("hex");

export const parseMigrationFilename = (filename) => {
  const match = MIGRATION_FILE_PATTERN.exec(filename);

  if (!match) {
    return null;
  }

  return {
    version: match[1],
    filename,
  };
};

export const isProductionDatabaseTarget = (databaseUrl) => {
  const normalized = databaseUrl.toLowerCase();

  return (
    normalized.includes("prod") ||
    normalized.includes("production") ||
    normalized.includes("vercel")
  );
};

export const assertMigrationTargetAllowed = (databaseUrl) => {
  if (!isProductionDatabaseTarget(databaseUrl)) {
    return;
  }

  if (process.env[PRODUCTION_GUARD_ENV] === "1") {
    return;
  }

  throw new Error(
    `Refusing to migrate a production-like DATABASE_URL. Set ${PRODUCTION_GUARD_ENV}=1 only after human approval.`,
  );
};

const migrationsDirectory = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../db/migrations",
);

export const loadMigrationFiles = async () => {
  const entries = await readdir(migrationsDirectory);
  const migrations = entries
    .map((filename) => {
      const parsed = parseMigrationFilename(filename);

      if (!parsed) {
        return null;
      }

      return parsed;
    })
    .filter(Boolean)
    .sort((left, right) => left.version.localeCompare(right.version));

  const files = [];

  for (const migration of migrations) {
    const filePath = resolve(migrationsDirectory, migration.filename);
    const sql = await readFile(filePath, "utf8");

    files.push({
      ...migration,
      sql,
      checksum: checksumForMigration(sql),
    });
  }

  return files;
};

const ensureMigrationsTable = async (sql) => {
  await sql`
    create table if not exists schema_migrations (
      version text primary key,
      name text not null,
      checksum text not null,
      applied_at timestamp not null default now()
    )
  `;
};

export const getAppliedMigrations = async (sql) => {
  await ensureMigrationsTable(sql);
  const rows = await sql`
    select version, name, checksum, applied_at
    from schema_migrations
    order by version asc
  `;

  return rows.map((row) => ({
    version: String(row.version),
    name: String(row.name),
    checksum: String(row.checksum),
    appliedAt: String(row.applied_at),
  }));
};

export const runPendingMigrations = async (sql, options = {}) => {
  const migrations = await loadMigrationFiles();
  const applied = await getAppliedMigrations(sql);
  const appliedByVersion = new Map(applied.map((row) => [row.version, row]));
  const executed = [];

  for (const migration of migrations) {
    const existing = appliedByVersion.get(migration.version);

    if (existing) {
      if (existing.checksum !== migration.checksum) {
        throw new Error(
          `Migration ${migration.version} was already applied with a different checksum.`,
        );
      }

      continue;
    }

    if (!options.dryRun) {
      const statements = splitSqlStatements(migration.sql);

      for (const statement of statements) {
        await sql.query(statement);
      }

      await sql`
        insert into schema_migrations (version, name, checksum)
        values (${migration.version}, ${migration.filename}, ${migration.checksum})
      `;
    }

    executed.push(migration);
  }

  return executed;
};

const printStatus = async (sql) => {
  const migrations = await loadMigrationFiles();
  const applied = await getAppliedMigrations(sql);
  const appliedVersions = new Set(applied.map((row) => row.version));

  console.log("Migration status:");
  for (const migration of migrations) {
    const marker = appliedVersions.has(migration.version) ? "applied" : "pending";
    console.log(`  ${migration.version} ${migration.filename} [${marker}]`);
  }
};

const main = async () => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("Missing DATABASE_URL.");
    process.exit(1);
  }

  assertMigrationTargetAllowed(databaseUrl);

  const sql = neon(databaseUrl);
  const isStatus = process.argv.includes("--status");

  if (isStatus) {
    await printStatus(sql);
    return;
  }

  const executed = await runPendingMigrations(sql);

  if (!executed.length) {
    console.log("No pending migrations.");
    return;
  }

  console.log(
    `Applied ${executed.length} migration(s): ${executed.map((migration) => migration.version).join(", ")}`,
  );
  console.log(
    "Backup reminder: create a Neon branch or snapshot before migrating production data.",
  );
};

const isDirectExecution =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === resolve(process.argv[1]);

if (isDirectExecution) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
