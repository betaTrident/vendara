import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      exclude: [
        "scripts/**",
        "dist/**",
        "tests/**",
        "src/pages/**",
        "src/components/**",
        "src/lib/db/**",
        "src/lib/client/**",
        "src/lib/server/**",
        "src/lib/auth/admin.ts",
      ],
      thresholds: {
        statements: 80,
        branches: 80,
        functions: 80,
        lines: 80,
      },
    },
    include: ["tests/**/*.test.ts"],
    exclude: ["tests/integration/**"],
  },
});
