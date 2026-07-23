import { describe, expect, it } from "vitest";

import { GET as getHealth } from "@/pages/api/health";

describe("health API", () => {
  it("returns a minimal public payload", async () => {
    const response = await getHealth({
      request: new Request("http://localhost/api/health"),
    } as never);

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({
      status: "ok",
      requestId: expect.any(String),
      timestamp: expect.any(String),
    });
    expect(body).not.toHaveProperty("databaseUrl");
    expect(body).not.toHaveProperty("version");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });
});
