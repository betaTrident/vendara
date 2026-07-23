import { describe, expect, it, vi, beforeEach } from "vitest";

import { jsonError, jsonOk, PRIVATE_RESPONSE_CACHE_HEADERS } from "@/lib/api";

describe("private cache policy", () => {
  it("applies no-store headers to successful private API responses", async () => {
    const response = jsonOk({ ok: true }, { requestId: "req-private-ok" });

    expect(response.headers.get("cache-control")).toBe(
      PRIVATE_RESPONSE_CACHE_HEADERS["Cache-Control"],
    );
    expect(response.headers.get("pragma")).toBe(
      PRIVATE_RESPONSE_CACHE_HEADERS.Pragma,
    );
    expect(response.headers.get("x-request-id")).toBe("req-private-ok");
  });

  it("applies no-store headers to private API error responses", async () => {
    const response = jsonError(
      "UNAUTHENTICATED",
      "Unauthorized.",
      401,
      { requestId: "req-private-error" },
    );

    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("x-request-id")).toBe("req-private-error");
  });
});
