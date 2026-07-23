import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import { VENDARA_PWA_MANIFEST } from "@/lib/pwa/cache-policy";

describe("PWA manifest", () => {
  it("declares installability fields required by the product plan", () => {
    expect(VENDARA_PWA_MANIFEST).toMatchObject({
      id: "/",
      name: "Vendara",
      short_name: "Vendara",
      start_url: "/admin",
      scope: "/",
      display: "standalone",
      lang: "en-PH",
      theme_color: "#ff385c",
      background_color: "#f7f7f7",
    });
    expect(VENDARA_PWA_MANIFEST.icons.length).toBeGreaterThanOrEqual(3);
  });

  it("wires manifest into the Astro PWA integration", () => {
    const astroConfig = readFileSync(resolve(process.cwd(), "astro.config.mjs"), "utf8");

    expect(astroConfig).toContain("@vite-pwa/astro");
    expect(astroConfig).toContain("VENDARA_PWA_MANIFEST");
    expect(astroConfig).toContain("buildWorkboxRuntimeCaching");
  });

  it("ships required icon assets", () => {
    const iconPaths = [
      "public/icons/icon-192x192.png",
      "public/icons/icon-512x512.png",
      "public/icons/icon-maskable-512x512.png",
      "public/icons/apple-touch-icon-180x180.png",
    ];

    iconPaths.forEach((relativePath) => {
      const buffer = readFileSync(resolve(process.cwd(), relativePath));
      expect(buffer.byteLength).toBeGreaterThan(100);
    });
  });
});
