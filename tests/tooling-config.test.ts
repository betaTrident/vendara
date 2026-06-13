import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, test } from "vitest";

const readJson = <T>(relativePath: string): T => {
  const filePath = resolve(process.cwd(), relativePath);
  const content = readFileSync(filePath, "utf8");

  return JSON.parse(content) as T;
};

describe("tooling configuration", () => {
  test("declares a local TypeScript compiler and Node type definitions", () => {
    const packageJson = readJson<{
      devDependencies?: Record<string, string>;
    }>("package.json");

    expect(packageJson.devDependencies).toMatchObject({
      "@types/node": expect.any(String),
      typescript: expect.any(String),
    });
  });

  test("avoids deprecated baseUrl and includes node types for server files", () => {
    const tsConfig = readJson<{
      compilerOptions?: {
        baseUrl?: string;
        types?: string[];
      };
    }>("tsconfig.json");

    expect(tsConfig.compilerOptions?.baseUrl).toBeUndefined();
    expect(tsConfig.compilerOptions?.types).toEqual(
      expect.arrayContaining(["node", "vitest/globals"]),
    );
  });
});
