import { describe, expect, it } from "vitest";

import {
  isSafeClientErrorMessage,
  jsonError,
  toSafeErrorMessage,
} from "@/lib/api";

describe("api error safety", () => {
  it("returns structured error objects with codes and request IDs", async () => {
    const response = jsonError(
      "VALIDATION_ERROR",
      "Check the highlighted fields.",
      400,
      { requestId: "req-123", details: { field: "name" } },
    );
    const body = await response.json();

    expect(body).toEqual({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Check the highlighted fields.",
        requestId: "req-123",
      },
      details: { field: "name" },
    });
  });

  it("blocks unsafe internal error text from reaching clients", () => {
    expect(isSafeClientErrorMessage("duplicate key value violates unique constraint")).toBe(
      false,
    );
    expect(isSafeClientErrorMessage("Product not found.")).toBe(true);
    expect(
      toSafeErrorMessage("Unable to save.", new Error("JWT expired unexpectedly")),
    ).toBe("Unable to save.");
    expect(
      toSafeErrorMessage("Unable to save.", new Error("Product not found.")),
    ).toBe("Product not found.");
  });
});
