import type { APIRoute } from "astro";
import { ZodError } from "zod";

import { jsonError, jsonOk } from "@/lib/api";
import { requireAdmin, requireTrustedAdmin } from "@/lib/auth/admin";
import {
  deleteCustomer,
  getCustomerById,
  updateCustomer,
} from "@/lib/server/customers-repository";
import { customerSchema } from "@/lib/validation";

export const GET: APIRoute = async ({ params, request }) => {
  const admin = await requireAdmin(request);

  if (admin instanceof Response) {
    return admin;
  }

  if (!params.id) {
    return jsonError("Missing customer ID.");
  }

  const customer = await getCustomerById(params.id);

  if (!customer) {
    return jsonError("Customer not found.", 404);
  }

  return jsonOk(customer);
};

export const PUT: APIRoute = async ({ params, request }) => {
  const admin = await requireTrustedAdmin(request);

  if (admin instanceof Response) {
    return admin;
  }

  if (!params.id) {
    return jsonError("Missing customer ID.");
  }

  try {
    const data = customerSchema.parse(await request.json());
    const customer = await updateCustomer({
      id: params.id,
      name: data.name,
      note: data.note ?? null,
    });

    return jsonOk(customer);
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError("Invalid customer payload.", 400, error.flatten());
    }

    return jsonError("Unable to update customer.", 500);
  }
};

export const DELETE: APIRoute = async ({ params, request }) => {
  const admin = await requireTrustedAdmin(request);

  if (admin instanceof Response) {
    return admin;
  }

  if (!params.id) {
    return jsonError("Missing customer ID.");
  }

  await deleteCustomer(params.id);

  return jsonOk({
    deleted: true,
  });
};
