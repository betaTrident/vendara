import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, test } from "vitest";

describe("brand assets and logo boundary", () => {
  test("ships optimized public brand derivatives from canonical sources", () => {
    const required = [
      "public/brand/vendara-wordmark-light.svg",
      "public/brand/vendara-wordmark-dark.svg",
      "public/brand/vendara-mark.svg",
      "public/brand/vendara-app-icon-192.png",
      "public/brand/vendara-app-icon-512.png",
    ];

    for (const relativePath of required) {
      expect(existsSync(resolve(process.cwd(), relativePath))).toBe(true);
    }
  });

  test("VendaraLogo is the single typed brand boundary", () => {
    const source = readFileSync(
      resolve(process.cwd(), "src/components/app/branding/VendaraLogo.tsx"),
      "utf8",
    );

    expect(source).toContain('variant: "horizontal" | "stacked" | "icon"');
    expect(source).toContain("getWordmarkSrc");
    expect(source).toContain("aria-hidden");
  });

  test("placeholder rose marks are removed from shared chrome", () => {
    const topBar = readFileSync(
      resolve(process.cwd(), "src/components/app/AppTopBar.tsx"),
      "utf8",
    );
    const login = readFileSync(
      resolve(process.cwd(), "src/components/app/AdminLogin.tsx"),
      "utf8",
    );

    expect(topBar).toContain("VendaraLogo");
    expect(topBar).not.toContain("#ff385c");
    expect(login).toContain("VendaraLogo");
    expect(login).not.toMatch(/fill="#ff385c"|bg-primary[\s\S]{0,80}<svg/);
  });

  test("BaseLayout bootstraps theme before paint", () => {
    const layout = readFileSync(
      resolve(process.cwd(), "src/layouts/BaseLayout.astro"),
      "utf8",
    );
    const theme = readFileSync(resolve(process.cwd(), "src/lib/theme.ts"), "utf8");

    expect(layout).toContain("THEME_BOOTSTRAP_SCRIPT");
    expect(layout).toContain("is:inline");
    expect(theme).toContain("vendara-theme");
    expect(theme).toContain("classList.add('dark')");
    expect(theme).toContain("prefers-color-scheme");
  });
});
