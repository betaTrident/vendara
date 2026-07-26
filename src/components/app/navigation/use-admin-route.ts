import { useCallback, useEffect, useState } from "react";

import {
  getCurrentAdminLocation,
  parseAdminLocation,
  resolvePostAuthPath,
  titleForAdminRoute,
  type AdminRoute,
} from "@/lib/admin/routes";
import {
  buildLastSafeViewPath,
  writeLastSafeViewPath,
} from "@/lib/pwa/last-safe-view";

export interface UseAdminRouteOptions {
  /** Path provided by Astro catch-all / entry page before hydration. */
  initialPath?: string;
  /** When true, replace bare `/admin` with overview after auth. */
  isAuthenticated: boolean;
}

function readBrowserLocation(): { pathname: string; search: string } {
  if (typeof window === "undefined") {
    return { pathname: "/admin", search: "" };
  }

  return {
    pathname: window.location.pathname,
    search: window.location.search,
  };
}

function applyDocumentTitle(route: AdminRoute): void {
  if (typeof document === "undefined") {
    return;
  }

  document.title = titleForAdminRoute(route);
}

/**
 * Path-based admin navigation without a third-party SPA router.
 * Uses History API so back/forward restore the correct page.
 */
export function useAdminRoute({
  initialPath,
  isAuthenticated,
}: UseAdminRouteOptions) {
  const [route, setRoute] = useState<AdminRoute>(() => {
    if (typeof window !== "undefined") {
      return getCurrentAdminLocation(window.location);
    }

    if (initialPath) {
      return parseAdminLocation(initialPath);
    }

    return parseAdminLocation("/admin");
  });

  const syncFromLocation = useCallback(() => {
    const next = getCurrentAdminLocation(readBrowserLocation());
    setRoute(next);
    applyDocumentTitle(next);
  }, []);

  const navigate = useCallback(
    (href: string, options?: { replace?: boolean }) => {
      if (typeof window === "undefined") {
        return;
      }

      const url = new URL(href, window.location.origin);
      if (!url.pathname.startsWith("/admin")) {
        return;
      }

      const method = options?.replace ? "replaceState" : "pushState";
      window.history[method]({}, "", `${url.pathname}${url.search}`);
      syncFromLocation();
    },
    [syncFromLocation],
  );

  useEffect(() => {
    syncFromLocation();

    const onPopState = () => {
      syncFromLocation();
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [syncFromLocation]);

  useEffect(() => {
    if (!isAuthenticated || typeof window === "undefined") {
      return;
    }

    const { pathname, search } = readBrowserLocation();
    const target = resolvePostAuthPath(pathname, search);
    const current = `${pathname}${search}`;

    if (target !== current && (pathname === "/admin" || pathname === "/admin/")) {
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    applyDocumentTitle(route);
  }, [route]);

  useEffect(() => {
    if (!isAuthenticated || typeof window === "undefined") {
      return;
    }

    const path = buildLastSafeViewPath(route);
    if (path) {
      writeLastSafeViewPath(path);
    }
  }, [isAuthenticated, route]);

  return {
    route,
    navigate,
    syncFromLocation,
  };
}
