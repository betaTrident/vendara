import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, test } from "vitest";

const REQUIRED_VIEWPORTS = [
  { name: "visual-mobile-360", width: 360, height: 800 },
  { name: "visual-tablet-768", width: 768, height: 1024 },
  { name: "visual-laptop-1024", width: 1024, height: 768 },
  { name: "visual-desktop-1440", width: 1440, height: 1024 },
] as const;

describe("Playwright visual matrix harness", () => {
  test("declares viewport projects required by the redesign plan", () => {
    const configPath = resolve(process.cwd(), "playwright.config.ts");
    const source = readFileSync(configPath, "utf8");

    for (const viewport of REQUIRED_VIEWPORTS) {
      expect(source).toContain(`name: "${viewport.name}"`);
      expect(source).toContain(`width: ${viewport.width}`);
      expect(source).toContain(`height: ${viewport.height}`);
    }

    expect(source).toContain("testMatch: /visual\\//");
    expect(source).toContain("colorScheme");
    expect(source).toContain("vendara-theme");
    expect(source).toContain('"light"');
    expect(source).toContain('"dark"');
  });

  test("keeps a default functional chromium project for non-visual e2e", () => {
    const configPath = resolve(process.cwd(), "playwright.config.ts");
    const source = readFileSync(configPath, "utf8");

    expect(source).toContain('name: "chromium"');
    expect(source).toContain("testIgnore: /visual\\//");
  });
});
