export type WorkboxRuntimeCachingRule = {
  urlPattern: RegExp | string | ((context: { request: Request; url: URL }) => boolean);
  handler: "NetworkOnly" | "NetworkFirst" | "CacheFirst";
  options?: Record<string, unknown>;
};

/** Paths that must never be stored by the service worker. */
export const PRIVATE_CACHE_URL_PATTERNS: ReadonlyArray<RegExp> = [/^\/api\//, /\/api\//];

export const OFFLINE_PAGE_PATH = "/offline";

export const VENDARA_PWA_MANIFEST = {
  id: "/",
  name: "Vendara",
  short_name: "Vendara",
  description: "Private product pricing and customer credit ledger for the store owner.",
  start_url: "/admin",
  scope: "/",
  display: "standalone" as const,
  orientation: "any" as const,
  theme_color: "#2563ff",
  background_color: "#f7f9fc",
  lang: "en-PH",
  icons: [
    {
      src: "/icons/icon-192x192.png",
      sizes: "192x192",
      type: "image/png",
    },
    {
      src: "/icons/icon-512x512.png",
      sizes: "512x512",
      type: "image/png",
    },
    {
      src: "/icons/icon-maskable-512x512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    },
  ],
};

export const shouldNeverCacheRequest = (
  url: string,
  request?: Pick<Request, "method" | "headers">,
): boolean => {
  if (request?.method && request.method !== "GET") {
    return true;
  }

  if (request?.headers?.has("Authorization")) {
    return true;
  }

  return PRIVATE_CACHE_URL_PATTERNS.some((pattern) => pattern.test(url));
};

export const buildWorkboxRuntimeCaching = (
  neonAuthOrigin?: string,
): WorkboxRuntimeCachingRule[] => {
  const rules: WorkboxRuntimeCachingRule[] = [
    {
      urlPattern: ({ request, url }) => shouldNeverCacheRequest(url.href, request),
      handler: "NetworkOnly",
      options: {
        cacheName: "vendara-private-network-only",
      },
    },
  ];

  if (neonAuthOrigin) {
    rules.push({
      urlPattern: ({ url }) => url.origin === neonAuthOrigin,
      handler: "NetworkOnly",
      options: {
        cacheName: "vendara-auth-network-only",
      },
    });
  }

  rules.push({
    urlPattern: ({ request }) => request.destination === "document",
    handler: "NetworkFirst",
    options: {
      cacheName: "vendara-documents",
      networkTimeoutSeconds: 5,
      expiration: {
        maxEntries: 8,
        maxAgeSeconds: 60 * 60,
      },
    },
  });

  rules.push({
    urlPattern: ({ request }) =>
      request.destination === "script" ||
      request.destination === "style" ||
      request.destination === "font" ||
      request.destination === "image",
    handler: "CacheFirst",
    options: {
      cacheName: "vendara-static-assets",
      expiration: {
        maxEntries: 96,
        maxAgeSeconds: 60 * 60 * 24 * 30,
      },
    },
  });

  return rules;
};
