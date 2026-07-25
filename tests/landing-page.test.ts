import { describe, expect, it } from "vitest";

import {
  LANDING_CTAS,
  LANDING_FEATURES,
  LANDING_HERO,
  LANDING_META,
  LANDING_NAV,
  collectLandingCopy,
  findUnsupportedPwaClaims,
} from "../src/lib/marketing/landing-content";

describe("public landing content contract", () => {
  it("uses the reference hero hierarchy", () => {
    expect(LANDING_HERO.headlinePrimary).toBe("Private store administration,");
    expect(LANDING_HERO.headlineAccent).toBe("made simpler.");
    expect(LANDING_HERO.supporting.length).toBeGreaterThan(40);
  });

  it("exposes complete public metadata without unverifiable claims", () => {
    expect(LANDING_META.title.length).toBeGreaterThan(20);
    expect(LANDING_META.title.length).toBeLessThanOrEqual(70);
    expect(LANDING_META.description.length).toBeGreaterThan(70);
    expect(LANDING_META.description.length).toBeLessThanOrEqual(160);
    expect(LANDING_META.canonicalPath).toBe("/");
    expect(LANDING_META.ogType).toBe("website");
  });

  it("keeps every CTA on a safe public destination", () => {
    expect(LANDING_CTAS.adminSignIn).toBe("/admin");
    expect(LANDING_CTAS.viewScreens).toBe("#product");
    expect(LANDING_CTAS.features).toBe("#features");
    expect(LANDING_CTAS.howItWorks).toBe("#how-it-works");
    expect(LANDING_CTAS.pwa).toBe("#pwa");
    expect(LANDING_CTAS.faq).toBe("#faq");
    expect(
      Object.values(LANDING_CTAS).every((href) => href.startsWith("/") || href.startsWith("#")),
    ).toBe(true);
    expect(Object.values(LANDING_CTAS).every((href) => href.length > 1)).toBe(true);
  });

  it("anchors nav labels to real in-page sections", () => {
    expect(LANDING_NAV.map((item) => item.href)).toEqual([
      "#features",
      "#how-it-works",
      "#product",
      "#pwa",
      "#faq",
    ]);
  });

  it("covers the six required feature themes without inventory scope", () => {
    expect(LANDING_FEATURES).toHaveLength(6);
    const blob = LANDING_FEATURES.map((f) => `${f.title} ${f.body}`).join(" ");
    expect(blob).toMatch(/price/i);
    expect(blob).toMatch(/customer/i);
    expect(blob).toMatch(/credit/i);
    expect(blob).toMatch(/payment/i);
    expect(blob).toMatch(/ledger/i);
    expect(blob).toMatch(/install|PWA|workspace/i);
    expect(blob).not.toMatch(/stock|inventory|warehouse|marketplace|checkout/i);
  });

  it("rejects unsupported offline transaction / auto-sync marketing claims", () => {
    const hits = findUnsupportedPwaClaims(collectLandingCopy());
    expect(hits).toEqual([]);
  });
});
