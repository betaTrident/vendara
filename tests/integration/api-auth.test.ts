import { describe, expect, it } from "vitest";

import { GET as getProducts } from "@/pages/api/products";
import { GET as getCustomers } from "@/pages/api/customers";

describe("API auth integration", () => {
  it("requires authentication for product reads", async () => {
    const response = await getProducts({
      request: new Request("http://localhost/api/products"),
      url: new URL("http://localhost/api/products"),
    } as never);

    expect(response.status).toBe(401);
  });

  it("requires authentication for customer reads", async () => {
    const response = await getCustomers({
      request: new Request("http://localhost/api/customers"),
      url: new URL("http://localhost/api/customers"),
    } as never);

    expect(response.status).toBe(401);
  });
});
