import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, test } from "vitest";

describe("theme accessibility contracts", () => {
  test("global CSS defines light and dark semantic tokens with focus and reduced motion", () => {
    const css = readFileSync(resolve(process.cwd(), "src/styles/global.css"), "utf8");

    expect(css).toContain(".dark {");
    expect(css).toContain("--background:");
    expect(css).toContain("--sidebar:");
    expect(css).toContain("--chart-1:");
    expect(css).toContain("--overlay:");
    expect(css).toContain("--balance-outstanding:");
    expect(css).toContain(":focus-visible");
    expect(css).toContain("prefers-reduced-motion");
    expect(css).toContain("forced-colors");
    expect(css).toContain("safe-area-inset-bottom");
  });

  test("ThemeMenu exposes an accessible theme control", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/components/app/theme/ThemeMenu.tsx"),
      "utf8",
    );

    expect(source).toContain("aria-label");
    expect(source).toContain("DropdownMenuRadioGroup");
    expect(source).toContain("Light");
    expect(source).toContain("Dark");
    expect(source).toContain("System");
  });
});
