import { describe, expect, it } from "vitest";

import { createIdempotencyKey } from "@/lib/client/api";
import { parseIdempotencyKey } from "@/lib/api";

describe("owner workflow helpers", () => {
  it("creates UUID idempotency keys for ledger forms", () => {
    const key = createIdempotencyKey();

    expect(key).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });

  it("requires a valid idempotency header for financial writes", () => {
    const valid = parseIdempotencyKey(
      new Request("https://example.com", {
        headers: {
          "Idempotency-Key": createIdempotencyKey(),
        },
      }),
    );
    const missing = parseIdempotencyKey(new Request("https://example.com"));

    expect(valid.ok).toBe(true);
    expect(missing.ok).toBe(false);
  });
});
