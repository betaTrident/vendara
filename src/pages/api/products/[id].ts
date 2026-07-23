import type { APIRoute } from "astro";
import { ZodError } from "zod";

import {
  API_ERROR_CODES,
  jsonError,
  jsonOk,
  resolveRequestId,
} from "@/lib/api";
import { requireOwnerMutation } from "@/lib/auth/admin";
import { createProductService } from "@/lib/services/products";
import {
  deleteProduct,
  getProductById,
  saveProductUpdateWithPriceHistory,
} from "@/lib/server/products-repository";
import { parseRouteUuid, productSchema } from "@/lib/validation";

const productService = createProductService({
  saveProductUpdateWithPriceHistory,
});

export const PUT: APIRoute = async ({ params, request }) => {
  const owner = await requireOwnerMutation(request);
  const requestId = resolveRequestId(request);

  if (owner instanceof Response) {
    return owner;
  }

  const productId = parseRouteUuid(params.id);

  if (!productId.ok) {
    return jsonError(
      API_ERROR_CODES.VALIDATION_ERROR,
      "Product ID must be a valid UUID.",
      400,
      { requestId },
    );
  }

  const previous = await getProductById(productId.value);

  if (!previous) {
    return jsonError(
      API_ERROR_CODES.NOT_FOUND,
      "Product not found.",
      404,
      { requestId },
    );
  }

  try {
    const data = productSchema.parse(await request.json());

    const updated = await productService.update({
      id: productId.value,
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

    return jsonOk(updated, { requestId });
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError(
        API_ERROR_CODES.VALIDATION_ERROR,
        "Invalid product payload.",
        400,
        { requestId, details: error.flatten() },
      );
    }

    return jsonError(
      API_ERROR_CODES.INTERNAL_ERROR,
      "Unable to update product.",
      500,
      { requestId },
    );
  }
};

export const DELETE: APIRoute = async ({ params, request }) => {
  const owner = await requireOwnerMutation(request);
  const requestId = resolveRequestId(request);

  if (owner instanceof Response) {
    return owner;
  }

  const productId = parseRouteUuid(params.id);

  if (!productId.ok) {
    return jsonError(
      API_ERROR_CODES.VALIDATION_ERROR,
      "Product ID must be a valid UUID.",
      400,
      { requestId },
    );
  }

  await deleteProduct(productId.value);

  return jsonOk(
    {
      deleted: true,
    },
    { requestId },
  );
};
