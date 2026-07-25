import type { Page } from "@playwright/test";

export type VendaraThemePreference = "light" | "dark" | "system";

/** Storage key used by the Phase 1 theme bootstrap (`src/lib/theme.ts`). */
export const VENDARA_THEME_STORAGE_KEY = "vendara-theme";

/**
 * Apply a deterministic theme before navigation completes paint.
 * Safe no-op if theme bootstrap is not yet wired (Phase 0 harness).
 */
export async function applyTheme(
  page: Page,
  preference: VendaraThemePreference,
): Promise<void> {
  await page.addInitScript(
    ({ key, value }) => {
      try {
        window.localStorage.setItem(key, value);
      } catch {
        // Ignore quota / private-mode failures in harness.
      }
    },
    { key: VENDARA_THEME_STORAGE_KEY, value: preference },
  );

  if (preference === "light" || preference === "dark") {
    await page.emulateMedia({ colorScheme: preference });
  } else {
    await page.emulateMedia({ colorScheme: "light" });
  }
}

export async function expectDocumentTheme(
  page: Page,
  resolved: "light" | "dark",
): Promise<boolean> {
  const isDark = await page.locator("html").evaluate((el) =>
    el.classList.contains("dark"),
  );
  return resolved === "dark" ? isDark : !isDark;
}
