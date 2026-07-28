import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

import {
  OFFLINE_PAGE_COPY,
  OFFLINE_TIPS,
  findUnsupportedOfflineClaims,
} from "@/lib/pwa/offline-guidance";
import { findUnsupportedPwaClaims } from "@/lib/marketing/landing-content";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("offline page contracts", () => {
  it("ships truthful copy without unsupported transaction claims", () => {
    const hits = findUnsupportedOfflineClaims([
      OFFLINE_PAGE_COPY.heading,
      OFFLINE_PAGE_COPY.body,
      OFFLINE_PAGE_COPY.pwaNote,
      OFFLINE_PAGE_COPY.reconnectNote,
      ...OFFLINE_TIPS.flatMap((tip) => [tip.title, tip.body]),
    ]);

    expect(hits).toEqual([]);
    expect(findUnsupportedPwaClaims([OFFLINE_PAGE_COPY.body])).toEqual([]);
  });

  it("flags unsupported offline transaction claims in arbitrary copy", () => {
    expect(findUnsupportedOfflineClaims(["Works fully offline for purchases"])).toEqual([
      "Works fully offline for purchases",
    ]);
    expect(findUnsupportedOfflineClaims(["Safe to browse cached pages"])).toEqual(
      [],
    );
  });

  it("OfflinePageContent exposes working actions and accessible landmarks", () => {
    const content = read("src/components/app/offline/OfflinePageContent.tsx");
    const page = read("src/components/app/pages/OfflinePage.tsx");
    const astro = read("src/pages/offline.astro");

    expect(content).toContain('id="main-content"');
    expect(content).toContain("OFFLINE_PAGE_COPY.tryAgain");
    expect(content).toContain("OFFLINE_PAGE_COPY.lastView");
    expect(content).toContain("OFFLINE_PAGE_COPY.tips");
    expect(content).toContain("BRAND_WORDMARK_DARK_URL");
    expect(content).toContain("BRAND_WORDMARK_LIGHT_URL");
    expect(page).toContain("ThemeProvider");
    expect(astro).toContain("OfflinePage");
    expect(content).not.toContain("VendaraLogo");
  });

  it("last available view uses validated session storage helper", () => {
    const content = read("src/components/app/offline/OfflinePageContent.tsx");

    expect(content).toContain("readLastSafeViewPath");
    expect(content).not.toContain("localStorage");
  });
});
