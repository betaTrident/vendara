import { IDEMPOTENCY_KEY_HEADER } from "@/lib/api";

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
    requestId: string;
  };
  details?: unknown;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type OwnerMutationInit = RequestInit & {
  idempotencyKey?: string;
};

export const createIdempotencyKey = () => crypto.randomUUID();

export const fetchJson = async <T>(
  input: RequestInfo | URL,
  init?: OwnerMutationInit,
): Promise<T> => {
  const response = await fetch(input, {
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      ...(init?.idempotencyKey
        ? { [IDEMPOTENCY_KEY_HEADER]: init.idempotencyKey }
        : {}),
      ...(init?.headers ?? {}),
    },
    ...init,
  });
  const payload = (await response.json()) as ApiResponse<T>;

  if (!payload.success) {
    throw new Error(payload.error.message);
  }

  return payload.data;
};

export const fetchAdminJson = async <T>(
  input: RequestInfo | URL,
  init?: OwnerMutationInit,
): Promise<T> => {
  const { getAuthToken } = await import("@/lib/auth/client");
  const token = await getAuthToken();

  if (!token) {
    throw new Error("Unauthorized.");
  }

  return fetchJson<T>(input, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
  });
};
