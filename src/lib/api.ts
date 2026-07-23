export const API_ERROR_CODES = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  FORBIDDEN: "FORBIDDEN",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  OFFLINE: "OFFLINE",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  METHOD_NOT_ALLOWED: "METHOD_NOT_ALLOWED",
} as const;

export type ApiErrorCode =
  (typeof API_ERROR_CODES)[keyof typeof API_ERROR_CODES];

export const REQUEST_ID_HEADER = "x-request-id";
export const IDEMPOTENCY_KEY_HEADER = "Idempotency-Key";

const IDEMPOTENCY_KEY_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const REQUEST_ID_PATTERN = /^[a-zA-Z0-9_-]{8,64}$/;

export const resolveRequestId = (request?: Request) => {
  const fromHeader = request?.headers.get(REQUEST_ID_HEADER);

  if (fromHeader && REQUEST_ID_PATTERN.test(fromHeader)) {
    return fromHeader;
  }

  return crypto.randomUUID();
};

export const parseIdempotencyKey = (
  request: Request,
): { ok: true; value: string } | { ok: false; message: string } => {
  const raw = request.headers.get(IDEMPOTENCY_KEY_HEADER)?.trim();

  if (!raw) {
    return {
      ok: false,
      message: "Idempotency-Key header is required for financial writes.",
    };
  }

  if (!IDEMPOTENCY_KEY_PATTERN.test(raw)) {
    return {
      ok: false,
      message: "Idempotency-Key must be a UUID.",
    };
  }

  return { ok: true, value: raw };
};

export const PRIVATE_RESPONSE_CACHE_HEADERS = {
  "Cache-Control": "no-store",
  Pragma: "no-cache",
} as const;

const mergeHeaders = (
  init: ResponseInit | undefined,
  requestId: string,
  extra?: Record<string, string>,
) => {
  const headers = new Headers(init?.headers);

  headers.set(REQUEST_ID_HEADER, requestId);
  Object.entries(PRIVATE_RESPONSE_CACHE_HEADERS).forEach(([name, value]) => {
    headers.set(name, value);
  });

  if (extra) {
    Object.entries(extra).forEach(([name, value]) => {
      headers.set(name, value);
    });
  }

  return headers;
};

export const jsonOk = <T>(
  data: T,
  init?: ResponseInit & { requestId?: string },
) => {
  const requestId = init?.requestId ?? crypto.randomUUID();

  return Response.json(
    {
      success: true,
      data,
    },
    {
      ...init,
      headers: mergeHeaders(init, requestId),
    },
  );
};

export const jsonError = (
  code: ApiErrorCode,
  message: string,
  status: number,
  options?: {
    requestId?: string;
    details?: unknown;
    headers?: Record<string, string>;
  },
) => {
  const requestId = options?.requestId ?? crypto.randomUUID();

  return Response.json(
    {
      success: false,
      error: {
        code,
        message,
        requestId,
      },
      ...(options?.details !== undefined ? { details: options.details } : {}),
    },
    {
      status,
      headers: mergeHeaders(undefined, requestId, options?.headers),
    },
  );
};

export const isSafeClientErrorMessage = (message: string) => {
  const unsafePatterns = [
    /postgres/i,
    /neon/i,
    /sql/i,
    /constraint/i,
    /jwt/i,
    /token/i,
    /stack/i,
    /ECONNREFUSED/i,
  ];

  return !unsafePatterns.some((pattern) => pattern.test(message));
};

export const toSafeErrorMessage = (
  fallback: string,
  error: unknown,
) => {
  if (error instanceof Error && isSafeClientErrorMessage(error.message)) {
    return error.message;
  }

  return fallback;
};
