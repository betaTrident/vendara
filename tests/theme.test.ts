import { describe, expect, test } from "vitest";

import {
  THEME_STORAGE_KEY,
  THEME_COLOR_LIGHT,
  THEME_COLOR_DARK,
  parseThemePreference,
  resolveTheme,
  getThemeColorMeta,
  getWordmarkSrc,
  getMarkSrc,
  readStoredThemePreference,
  applyResolvedThemeToDocument,
} from "@/lib/theme";

describe("theme resolution", () => {
  test("defaults invalid or missing storage values to system", () => {
    expect(parseThemePreference(null)).toBe("system");
    expect(parseThemePreference(undefined)).toBe("system");
    expect(parseThemePreference("")).toBe("system");
    expect(parseThemePreference("neon")).toBe("system");
    expect(parseThemePreference("light")).toBe("light");
    expect(parseThemePreference("dark")).toBe("dark");
    expect(parseThemePreference("system")).toBe("system");
  });

  test("resolves system preference from prefers-color-scheme", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });

  test("maps resolved theme to meta theme-color and brand assets", () => {
    expect(getThemeColorMeta("light")).toBe(THEME_COLOR_LIGHT);
    expect(getThemeColorMeta("dark")).toBe(THEME_COLOR_DARK);
    expect(getWordmarkSrc("light")).toBe("/brand/vendara-wordmark-light.svg");
    expect(getWordmarkSrc("dark")).toBe("/brand/vendara-wordmark-dark.svg");
    expect(getMarkSrc()).toBe("/brand/vendara-mark.svg");
  });

  test("reads storage safely and never throws on malformed access", () => {
    const throwingStorage = {
      getItem: () => {
        throw new Error("blocked");
      },
    };

    expect(readStoredThemePreference(throwingStorage)).toBe("system");
    expect(readStoredThemePreference({ getItem: () => "dark" })).toBe("dark");
    expect(THEME_STORAGE_KEY).toBe("vendara-theme");
  });

  test("applies resolved class and color-scheme on a document-like target", () => {
    const classList = new Set<string>();
    const styles = new Map<string, string>();
    const meta = { content: "" };
    const doc = {
      documentElement: {
        classList: {
          add: (value: string) => {
            classList.add(value);
          },
          remove: (value: string) => {
            classList.delete(value);
          },
          contains: (value: string) => classList.has(value),
        },
        style: {
          setProperty: (key: string, value: string) => {
            styles.set(key, value);
          },
        },
      },
      querySelector: (selector: string) =>
        selector === 'meta[name="theme-color"]' ? meta : null,
    };

    applyResolvedThemeToDocument(doc, "dark");
    expect(classList.has("dark")).toBe(true);
    expect(styles.get("color-scheme")).toBe("dark");
    expect(meta.content).toBe(THEME_COLOR_DARK);

    applyResolvedThemeToDocument(doc, "light");
    expect(classList.has("dark")).toBe(false);
    expect(styles.get("color-scheme")).toBe("light");
    expect(meta.content).toBe(THEME_COLOR_LIGHT);
  });
});
