import type { APIRoute } from "astro";
import { ZodError } from "zod";

import {
  API_ERROR_CODES,
  jsonError,
  jsonOk,
  resolveRequestId,
} from "@/lib/api";
import { requireOwner, requireOwnerMutation } from "@/lib/auth/admin";
import { createCustomer, listCustomers } from "@/lib/server/customers-repository";
import { customerSchema } from "@/lib/validation";

export const GET: APIRoute = async ({ url, request }) => {
  const owner = await requireOwner(request);
  const requestId = resolveRequestId(request);

  if (owner instanceof Response) {
    return owner;
  }

  const search = url.searchParams.get("search") ?? undefined;

  return jsonOk(await listCustomers(search), { requestId });
};

export const POST: APIRoute = async ({ request }) => {
  const owner = await requireOwnerMutation(request);
  const requestId = resolveRequestId(request);

  if (owner instanceof Response) {
    return owner;
  }

  try {
    const data = customerSchema.parse(await request.json());

    return jsonOk(
      await createCustomer({
        name: data.name,
        note: data.note ?? null,
      }),
      { status: 201, requestId },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError(
        API_ERROR_CODES.VALIDATION_ERROR,
        "Invalid customer payload.",
        400,
        { requestId, details: error.flatten() },
      );
    }

    return jsonError(
      API_ERROR_CODES.INTERNAL_ERROR,
      "Unable to create customer.",
      500,
      { requestId },
    );
  }
};
