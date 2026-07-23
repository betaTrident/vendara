import { describe, expect, it } from "vitest";

import { GET as getHealth } from "@/pages/api/health";

describe("health API route", () => {
  it("returns only the approved public health fields", async () => {
    const response = await getHealth({
      request: new Request("http://localhost/api/health", {
        headers: { "x-request-id": "health-req-12345678" },
      }),
    } as never);

    const body = await response.json();
    expect(Object.keys(body).sort()).toEqual(["requestId", "status", "timestamp"]);
    expect(body.status).toBe("ok");
    expect(response.headers.get("x-request-id")).toBe("health-req-12345678");
  });
});
