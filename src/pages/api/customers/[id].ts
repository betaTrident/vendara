import type { APIRoute } from "astro";

import {
  API_ERROR_CODES,
  jsonError,
  jsonOk,
  resolveRequestId,
} from "@/lib/api";
import { requireOwner, requireOwnerMutation } from "@/lib/auth/admin";
import {
  deleteCustomer,
  getCustomerById,
  updateCustomer,
} from "@/lib/server/customers-repository";
import { customerSchema, parseRouteUuid } from "@/lib/validation";
import { ZodError } from "zod";

export const GET: APIRoute = async ({ params, request }) => {
  const owner = await requireOwner(request);
  const requestId = resolveRequestId(request);

  if (owner instanceof Response) {
    return owner;
  }

  const customerId = parseRouteUuid(params.id);

  if (!customerId.ok) {
    return jsonError(
      API_ERROR_CODES.VALIDATION_ERROR,
      "Customer ID must be a valid UUID.",
      400,
      { requestId },
    );
  }

  const customer = await getCustomerById(customerId.value);

  if (!customer) {
    return jsonError(
      API_ERROR_CODES.NOT_FOUND,
      "Customer not found.",
      404,
      { requestId },
    );
  }

  return jsonOk(customer, { requestId });
};

export const PUT: APIRoute = async ({ params, request }) => {
  const owner = await requireOwnerMutation(request);
  const requestId = resolveRequestId(request);

  if (owner instanceof Response) {
    return owner;
  }

  const customerId = parseRouteUuid(params.id);

  if (!customerId.ok) {
    return jsonError(
      API_ERROR_CODES.VALIDATION_ERROR,
      "Customer ID must be a valid UUID.",
      400,
      { requestId },
    );
  }

  try {
    const data = customerSchema.parse(await request.json());
    const customer = await updateCustomer({
      id: customerId.value,
      name: data.name,
      note: data.note ?? null,
    });

    return jsonOk(customer, { requestId });
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
      "Unable to update customer.",
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

  const customerId = parseRouteUuid(params.id);

  if (!customerId.ok) {
    return jsonError(
      API_ERROR_CODES.VALIDATION_ERROR,
      "Customer ID must be a valid UUID.",
      400,
      { requestId },
    );
  }

  await deleteCustomer(customerId.value);

  return jsonOk(
    {
      deleted: true,
    },
    { requestId },
  );
};
