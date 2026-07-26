import { describe, expect, it } from "vitest";

import {
  buildWorkboxRuntimeCaching,
  OFFLINE_PAGE_PATH,
  PRECACHE_EXCLUDE_PATTERNS,
  PRIVATE_CACHE_URL_PATTERNS,
  shouldExcludeFromPrecache,
  shouldNeverCacheRequest,
} from "@/lib/pwa/cache-policy";

describe("PWA cache policy", () => {
  it("never caches API routes or authorized requests", () => {
    expect(PRIVATE_CACHE_URL_PATTERNS.some((p) => p.test("/api/products"))).toBe(true);
    expect(
      shouldNeverCacheRequest("https://vendara.test/api/customers", {
        method: "GET",
        headers: new Headers({ Authorization: "Bearer token" }),
      }),
    ).toBe(true);
    expect(
      shouldNeverCacheRequest("https://vendara.test/api/products", {
        method: "POST",
        headers: new Headers(),
      }),
    ).toBe(true);
  });

  it("allows caching static shell assets", () => {
    expect(
      shouldNeverCacheRequest("https://vendara.test/_astro/app.js", {
        method: "GET",
        headers: new Headers(),
      }),
    ).toBe(false);
    expect(
      shouldNeverCacheRequest("https://vendara.test/icons/icon-192x192.png", {
        method: "GET",
        headers: new Headers(),
      }),
    ).toBe(false);
  });

  it("uses network-only rules for private and auth traffic", () => {
    const rules = buildWorkboxRuntimeCaching("https://auth.neon.test");

    const privateRule = rules[0];
    expect(privateRule.handler).toBe("NetworkOnly");
    expect(
      typeof privateRule.urlPattern === "function" &&
        privateRule.urlPattern({
          request: new Request("https://vendara.test/api/summary"),
          url: new URL("https://vendara.test/api/summary"),
        } as never),
    ).toBe(true);

    const authRule = rules[1];
    expect(authRule.handler).toBe("NetworkOnly");
    expect(
      typeof authRule.urlPattern === "function" &&
        authRule.urlPattern({
          request: new Request("https://auth.neon.test/get-session"),
          url: new URL("https://auth.neon.test/get-session"),
        } as never),
    ).toBe(true);
  });

  it("defines a dedicated offline fallback path", () => {
    expect(OFFLINE_PAGE_PATH).toBe("/offline");
  });

  it("includes document and static asset caching rules", () => {
    const rules = buildWorkboxRuntimeCaching();

    const documentRule = rules.find((rule) => rule.handler === "NetworkFirst");
    const staticRule = rules.find((rule) => rule.handler === "CacheFirst");

    expect(documentRule).toBeDefined();
    expect(staticRule).toBeDefined();

    const documentRequest = new Request("https://vendara.test/admin");
    Object.defineProperty(documentRequest, "destination", { value: "document" });
    expect(
      typeof documentRule?.urlPattern === "function" &&
        documentRule.urlPattern({
          request: documentRequest,
          url: new URL("https://vendara.test/admin"),
        } as never),
    ).toBe(true);

    const scriptRequest = new Request("https://vendara.test/_astro/app.js");
    Object.defineProperty(scriptRequest, "destination", { value: "script" });
    expect(
      typeof staticRule?.urlPattern === "function" &&
        staticRule.urlPattern({
          request: scriptRequest,
          url: new URL("https://vendara.test/_astro/app.js"),
        } as never),
    ).toBe(true);
  });

  it("excludes large logo sources and reference boards from precache", () => {
    expect(
      shouldExcludeFromPrecache(
        "src/components/app/assets/logo/light-mode.svg",
      ),
    ).toBe(true);
    expect(
      shouldExcludeFromPrecache(
        "src/components/app/assets/pages/offline.png",
      ),
    ).toBe(true);
    expect(shouldExcludeFromPrecache("public/icons/icon-192x192.png")).toBe(
      false,
    );
    expect(PRECACHE_EXCLUDE_PATTERNS.length).toBeGreaterThan(0);
  });
});
