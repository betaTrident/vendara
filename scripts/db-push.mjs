import { readFile } from "node:fs/promises";
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("Missing DATABASE_URL.");
  process.exit(1);
}

const sql = neon(databaseUrl);
const schemaSql = await readFile(new URL("../db/schema.sql", import.meta.url), "utf8");

const splitSqlStatements = (input) => {
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

const statements = splitSqlStatements(schemaSql);

for (const statement of statements) {
  await sql.query(statement);
}

console.log(`Database schema applied. Executed ${statements.length} statements.`);
