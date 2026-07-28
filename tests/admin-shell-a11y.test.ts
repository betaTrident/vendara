import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, test } from "vitest";

describe("admin shell accessibility contracts", () => {
  test("shell keeps one main landmark and labeled navigation regions", () => {
    const shell = readFileSync(
      resolve(process.cwd(), "src/components/app/layout/AdminShell.tsx"),
      "utf8",
    );
    const sidebar = readFileSync(
      resolve(process.cwd(), "src/components/app/layout/AdminSidebar.tsx"),
      "utf8",
    );
    const bottom = readFileSync(
      resolve(process.cwd(), "src/components/app/layout/MobileBottomNavigation.tsx"),
      "utf8",
    );

    expect(shell).toContain('id="main-content"');
    expect(shell.match(/id="main-content"/g)?.length).toBe(1);
    expect(sidebar).toContain('aria-label="Admin navigation"');
    expect(sidebar).toContain('aria-current={active ? "page" : undefined}');
    expect(bottom).toContain('aria-label="Mobile primary"');
    expect(bottom).toContain("min-h-14");
  });

  test("search and notifications stay honestly unavailable", () => {
    const topBar = readFileSync(
      resolve(process.cwd(), "src/components/app/layout/AdminTopBar.tsx"),
      "utf8",
    );

    expect(topBar).toContain('aria-label="Search unavailable"');
    expect(topBar).toContain('aria-label="Notifications unavailable"');
    expect(topBar).toContain("disabled");
  });

  test("keeps the sidebar collapsible at laptop widths", () => {
    const shell = readFileSync(
      resolve(process.cwd(), "src/components/app/layout/AdminShell.tsx"),
      "utf8",
    );
    const topBar = readFileSync(
      resolve(process.cwd(), "src/components/app/layout/AdminTopBar.tsx"),
      "utf8",
    );

    expect(shell).toContain('className="hidden xl:block"');
    expect(topBar).toContain("xl:hidden");
    expect(topBar).not.toContain("lg:hidden");
  });
});
