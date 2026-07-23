import type { APIRoute } from "astro";
import { ZodError } from "zod";

import {
  API_ERROR_CODES,
  jsonError,
  jsonOk,
  resolveRequestId,
  toSafeErrorMessage,
} from "@/lib/api";
import { requireOwner, requireOwnerMutation } from "@/lib/auth/admin";
import { createProduct, listProducts } from "@/lib/server/products-repository";
import { productSchema } from "@/lib/validation";

export const GET: APIRoute = async ({ url, request }) => {
  const owner = await requireOwner(request);
  const requestId = resolveRequestId(request);

  if (owner instanceof Response) {
    return owner;
  }

  const search = url.searchParams.get("search") ?? undefined;
  const products = await listProducts(search);

  return jsonOk(products, { requestId });
};

export const POST: APIRoute = async ({ request }) => {
  const owner = await requireOwnerMutation(request);
  const requestId = resolveRequestId(request);

  if (owner instanceof Response) {
    return owner;
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
      requestId,
    });
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
      "Unable to create product.",
      500,
      { requestId },
    );
  }
};
