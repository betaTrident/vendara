import { describe, expect, it } from "vitest";

import {
  parseHistoryPagination,
  parsePriceHistoryRange,
} from "@/lib/domain/pricing";

describe("product history API query contracts", () => {
  it("accepts supported ranges and rejects unknown values", () => {
    expect(parsePriceHistoryRange(null)).toBe("all");
    expect(parsePriceHistoryRange("7d")).toBe("7d");
    expect(parsePriceHistoryRange("30d")).toBe("30d");
    expect(parsePriceHistoryRange("90d")).toBe("90d");
    expect(parsePriceHistoryRange("all")).toBe("all");
    expect(parsePriceHistoryRange("year")).toBeNull();
  });

  it("clamps pagination to safe integer bounds", () => {
    expect(parseHistoryPagination({})).toEqual({
      ok: true,
      limit: 50,
      offset: 0,
    });
    expect(parseHistoryPagination({ limit: "100", offset: "10" })).toEqual({
      ok: true,
      limit: 100,
      offset: 10,
    });
    expect(parseHistoryPagination({ limit: "0", offset: "0" }).ok).toBe(false);
    expect(parseHistoryPagination({ limit: "101", offset: "0" }).ok).toBe(false);
    expect(parseHistoryPagination({ limit: "10", offset: "1.5" }).ok).toBe(
      false,
    );
  });
});
