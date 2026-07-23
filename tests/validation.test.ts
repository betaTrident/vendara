import { describe, expect, it } from "vitest";

import { parseRouteUuid } from "@/lib/validation";

describe("validation helpers", () => {
  it("accepts valid route UUIDs", () => {
    const id = "550e8400-e29b-41d4-a716-446655440000";
    expect(parseRouteUuid(id)).toEqual({ ok: true, value: id });
  });

  it("rejects invalid route UUIDs", () => {
    expect(parseRouteUuid("not-a-uuid")).toEqual({ ok: false });
    expect(parseRouteUuid(undefined)).toEqual({ ok: false });
  });
});
