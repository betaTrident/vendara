/**
 * Canonical Vendara logo sources live under `src/components/app/assets/logo/`.
 * Runtime UI should use the optimized `/brand/*` derivatives produced by
 * `scripts/optimize-brand-assets.mjs` — never the multi-megabyte source SVGs.
 */
export const BRAND_LOGO_SOURCES = {
  lightWordmark: "src/components/app/assets/logo/light-modee.svg",
  darkWordmark: "src/components/app/assets/logo/darkmode.svg",
} as const;

export const BRAND_WORDMARK_LIGHT_URL = "/brand/vendara-wordmark-light.svg";
export const BRAND_WORDMARK_DARK_URL = "/brand/vendara-wordmark-dark.svg";
export const BRAND_MARK_URL = "/brand/vendara-mark.svg";

export type BrandResolvedTheme = "light" | "dark";

export const getBrandWordmarkUrl = (resolved: BrandResolvedTheme): string =>
  resolved === "dark" ? BRAND_WORDMARK_DARK_URL : BRAND_WORDMARK_LIGHT_URL;
