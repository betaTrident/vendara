import type { APIRoute } from "astro";
import { ZodError } from "zod";

import { jsonError, jsonOk } from "@/lib/api";
import { requireTrustedAdmin } from "@/lib/auth/admin";
import { createProduct, listProducts } from "@/lib/server/products-repository";
import { productSchema } from "@/lib/validation";

export const GET: APIRoute = async ({ url }) => {
  const search = url.searchParams.get("search") ?? undefined;
  const products = await listProducts(search);

  return jsonOk(products);
};

export const POST: APIRoute = async ({ request }) => {
  const admin = await requireTrustedAdmin(request);

  if (admin instanceof Response) {
    return admin;
  }

  try {
    const data = productSchema.parse(await request.json());
    const product = await createProduct({
      name: data.name,
      costPrice: data.costPrice,
      sellingPrice: data.sellingPrice,
      note: data.note ?? null,
    });

    return jsonOk(product, {
      status: 201,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError("Invalid product payload.", 400, error.flatten());
    }

    return jsonError("Unable to create product.", 500);
  }
};
