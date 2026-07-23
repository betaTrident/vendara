import { describe, expect, it } from "vitest";

import { multiplyMoney, parseMoney, sumMoney, toMoneyString } from "@/lib/domain/money";

describe("money utilities", () => {
  it("normalizes values to two decimal places", () => {
    expect(toMoneyString(12.3)).toBe("12.30");
    expect(parseMoney("15.5")).toBe(15.5);
  });

  it("multiplies unit prices using cent-safe arithmetic", () => {
    expect(multiplyMoney(10.15, 3)).toBe(30.45);
  });

  it("sums money values without floating-point drift", () => {
    expect(sumMoney([0.1, 0.2])).toBe(0.3);
    expect(sumMoney([10.15, 20.25])).toBe(30.4);
  });

  it("rejects invalid money and quantity inputs", () => {
    expect(() => toMoneyString(Number.NaN)).toThrow(/finite/i);
    expect(() => parseMoney("12.345")).toThrow(/two fractional digits/i);
    expect(() => multiplyMoney(10, 0)).toThrow(/positive integer/i);
  });
});
