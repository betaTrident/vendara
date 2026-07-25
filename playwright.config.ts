import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:4321";

/**
 * Visual matrix for redesign phases.
 * Theme preference storage key (Phase 1): vendara-theme
 * Functional E2E stays on the default chromium project; visual/* only.
 */
const visualViewports = [
  { name: "visual-mobile-360", width: 360, height: 800 },
  { name: "visual-tablet-768", width: 768, height: 1024 },
  { name: "visual-laptop-1024", width: 1024, height: 768 },
  { name: "visual-desktop-1440", width: 1440, height: 1024 },
] as const;

const visualThemes = ["light", "dark"] as const;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      testIgnore: /visual\//,
      use: { ...devices["Desktop Chrome"] },
    },
    ...visualViewports.flatMap((viewport) =>
      visualThemes.map((theme) => ({
        name: `${viewport.name}-${theme}`,
        testMatch: /visual\//,
        use: {
          ...devices["Desktop Chrome"],
          viewport: { width: viewport.width, height: viewport.height },
          colorScheme: theme,
        },
        metadata: {
          vendaraTheme: theme,
          vendaraViewport: viewport.name,
        },
      })),
    ),
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        // Vercel adapter does not support `astro preview`; use dev for local E2E.
        command: "npm run dev -- --host 127.0.0.1 --port 4321",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
