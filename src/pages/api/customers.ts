import type { APIRoute } from "astro";
import { ZodError } from "zod";

import { jsonError, jsonOk } from "@/lib/api";
import { requireAdmin, requireTrustedAdmin } from "@/lib/auth/admin";
import { createCustomer, listCustomers } from "@/lib/server/customers-repository";
import { customerSchema } from "@/lib/validation";

export const GET: APIRoute = async ({ url, request }) => {
  const admin = await requireAdmin(request);

  if (admin instanceof Response) {
    return admin;
  }

  const search = url.searchParams.get("search") ?? undefined;

  return jsonOk(await listCustomers(search));
};

export const POST: APIRoute = async ({ request }) => {
  const admin = await requireTrustedAdmin(request);

  if (admin instanceof Response) {
    return admin;
  }

  try {
    const data = customerSchema.parse(await request.json());

    return jsonOk(
      await createCustomer({
        name: data.name,
        note: data.note ?? null,
      }),
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return jsonError("Invalid customer payload.", 400, error.flatten());
    }

    return jsonError("Unable to create customer.", 500);
  }
};
