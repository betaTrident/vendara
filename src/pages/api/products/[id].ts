import type { APIRoute } from "astro";
import { ZodError } from "zod";

import { jsonError, jsonOk } from "@/lib/api";
import { requireTrustedAdmin } from "@/lib/auth/admin";
import { createProductService } from "@/lib/services/products";
import {
  deleteProduct,
  getProductById,
  savePriceHistory,
  saveProductUpdate,
} from "@/lib/server/products-repository";
import { productSchema } from "@/lib/validation";

const productService = createProductService({
  save: saveProductUpdate,
  savePriceHistory,
});

export const PUT: APIRoute = async ({ params, request }) => {
  const admin = await requireTrustedAdmin(request);

  if (admin instanceof Response) {
    return admin;
  }

  const productId = params.id;

  if (!productId) {
    return jsonError("Missing product ID.");
  }

  const previous = await getProductById(productId);

  if (!previous) {
    return jsonError("Product not found.", 404);
  }

  try {
    const data = productSchema.parse(await request.json());

    await productService.update({
      id: productId,
      previous: {
        name: previous.name,
        costPrice: previous.costPrice,
        sellingPrice: previous.sellingPrice,
        note: previous.note,
      },
      next: {
        name: data.name,
        costPrice: data.costPrice,
        sellingPrice: data.sellingPrice,
        note: data.note ?? null,
      },
    });

    const next = await getProductById(productId);

    return jsonOk(next);
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError("Invalid product payload.", 400, error.flatten());
    }

    return jsonError("Unable to update product.", 500);
  }
};

export const DELETE: APIRoute = async ({ params, request }) => {
  const admin = await requireTrustedAdmin(request);

  if (admin instanceof Response) {
    return admin;
  }

  if (!params.id) {
    return jsonError("Missing product ID.");
  }

  await deleteProduct(params.id);

  return jsonOk({
    deleted: true,
  });
};
