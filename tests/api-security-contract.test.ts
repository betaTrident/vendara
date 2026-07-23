import { describe, expect, it, vi, beforeEach } from "vitest";

import { GET as getProducts } from "@/pages/api/products";
import { PUT as putLedgerEntry, DELETE as deleteLedgerEntry } from "@/pages/api/ledger/[entryId]";

vi.mock("@/lib/server/products-repository", () => ({
  listProducts: vi.fn().mockResolvedValue([]),
  createProduct: vi.fn(),
}));

describe("api security contract", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejects anonymous product reads", async () => {
    const response = await getProducts({
      request: new Request("http://localhost/api/products"),
      url: new URL("http://localhost/api/products"),
    } as never);

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error.code).toBe("UNAUTHENTICATED");
    expect(response.headers.get("cache-control")).toBe("no-store");
  });

  it("rejects ledger entry updates so entry type cannot change", async () => {
    const request = new Request("http://localhost/api/ledger/entry-1", {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        origin: "http://localhost",
        host: "localhost",
      },
      body: JSON.stringify({
        entryType: "payment",
        entryDate: "2026-06-13",
        paymentAmount: 10,
      }),
    });

    const response = await putLedgerEntry({
      request,
      params: { entryId: "550e8400-e29b-41d4-a716-446655440000" },
    } as never);

    expect(response.status).toBe(405);
    expect(response.headers.get("allow")).toBe("GET, HEAD");
    const body = await response.json();
    expect(body.error.code).toBe("METHOD_NOT_ALLOWED");
  });

  it("rejects hard ledger deletion", async () => {
    const request = new Request("http://localhost/api/ledger/entry-1", {
      method: "DELETE",
      headers: {
        origin: "http://localhost",
        host: "localhost",
      },
    });

    const response = await deleteLedgerEntry({
      request,
      params: { entryId: "550e8400-e29b-41d4-a716-446655440000" },
    } as never);

    expect(response.status).toBe(405);
  });
});
