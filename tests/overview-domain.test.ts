import { describe, expect, test } from "vitest";

import {
  AGING_BUCKET_DEFS,
  classifyAgingBucket,
  daysBetweenDates,
  emptyAgingCounts,
  formatOverviewGreeting,
  overviewWeekLabel,
} from "@/lib/domain/overview";

describe("overview domain helpers", () => {
  test("classifies aging from oldest outstanding debt age", () => {
    expect(classifyAgingBucket(0)).toBe("current");
    expect(classifyAgingBucket(1)).toBe("late-1-7");
    expect(classifyAgingBucket(7)).toBe("late-1-7");
    expect(classifyAgingBucket(8)).toBe("late-8-30");
    expect(classifyAgingBucket(30)).toBe("late-8-30");
    expect(classifyAgingBucket(31)).toBe("late-30-plus");
  });

  test("computes whole-day distance without inventing timezone math beyond UTC dates", () => {
    expect(daysBetweenDates("2026-07-01", "2026-07-01")).toBe(0);
    expect(daysBetweenDates("2026-07-01", "2026-07-08")).toBe(7);
    expect(daysBetweenDates("2026-06-01", "2026-07-01")).toBe(30);
  });

  test("builds honest greeting and week label without mock owner names", () => {
    expect(formatOverviewGreeting(9)).toBe("Magandang umaga");
    expect(formatOverviewGreeting(13)).toBe("Magandang hapon");
    expect(formatOverviewGreeting(20)).toBe("Magandang gabi");
    expect(overviewWeekLabel(new Date("2026-07-25T04:00:00.000Z"))).toMatch(
      /Week \d+/i,
    );
    expect(formatOverviewGreeting(9)).not.toMatch(/Aling|Nena|Juan/i);
  });

  test("aging defs cover four buckets and empty counts start at zero", () => {
    expect(AGING_BUCKET_DEFS).toHaveLength(4);
    expect(emptyAgingCounts()).toEqual({
      current: 0,
      "late-1-7": 0,
      "late-8-30": 0,
      "late-30-plus": 0,
    });
  });
});
