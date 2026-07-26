import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const read = (relativePath: string) =>
  readFileSync(resolve(process.cwd(), relativePath), "utf8");

describe("phase 8 PWA integration contracts", () => {
  it("tracks last safe admin views during navigation", () => {
    const routeHook = read("src/components/app/navigation/use-admin-route.ts");

    expect(routeHook).toContain("writeLastSafeViewPath");
    expect(routeHook).toContain("buildLastSafeViewPath");
  });

  it("announces reconnection without discarding dirty forms", () => {
    const consoleSource = read("src/components/app/AdminConsole.tsx");
    const prompt = read("src/components/app/PwaUpdatePrompt.tsx");

    expect(consoleSource).toContain("ReconnectAnnouncement");
    expect(consoleSource).toContain("acknowledgeReconnected");
    expect(consoleSource).toContain("hasUnsavedChanges");
    expect(prompt).toContain("hasDirtyForm");
    expect(prompt).toContain("unsaved changes");
  });

  it("rejects private API caching in workbox runtime rules", () => {
    const policy = read("src/lib/pwa/cache-policy.ts");

    expect(policy).toContain("NetworkOnly");
    expect(policy).toContain("PRIVATE_CACHE_URL_PATTERNS");
    expect(policy).toContain("PRECACHE_GLOB_IGNORES");
  });
});
