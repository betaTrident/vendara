import { useEffect, useState } from "react";

import { authClient, getAuthToken } from "@/lib/auth/client";
import { fetchAdminJson } from "@/lib/client/api";
import type { OwnerSummary } from "@/lib/types";
import { usePwaState } from "@/lib/pwa/use-pwa-state";

import { AdminLogin } from "./AdminLogin";
import { AppTopBar } from "./AppTopBar";
import { CustomerManager } from "./CustomerManager";
import { PwaUpdatePrompt } from "./PwaUpdatePrompt";
import { ThemeProvider } from "./theme/ThemeProvider";
import { AdminShell } from "./layout/AdminShell";
import { useAdminRoute } from "./navigation/use-admin-route";
import { AdminNotFoundPage } from "./pages/AdminNotFoundPage";
import { OverviewPage } from "./pages/OverviewPage";
import { ProductPriceHistoryPage } from "./pages/ProductPriceHistoryPage";
import { ProductsPage } from "./pages/ProductsPage";
import { RoutePlaceholderPage } from "./pages/RoutePlaceholderPage";

interface AdminConsoleProps {
  /** Path from Astro entry or catch-all before client hydration. */
  initialPath?: string;
}

export const AdminConsole = ({ initialPath }: AdminConsoleProps = {}) => {
  return (
    <ThemeProvider>
      <AdminConsoleInner initialPath={initialPath} />
    </ThemeProvider>
  );
};

const AdminConsoleInner = ({ initialPath }: AdminConsoleProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [summary, setSummary] = useState<OwnerSummary | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryLoaded, setSummaryLoaded] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [updateDismissed, setUpdateDismissed] = useState(false);
  const { isOnline, needRefresh, updateServiceWorker } = usePwaState();
  const { route, navigate } = useAdminRoute({
    initialPath,
    isAuthenticated,
  });

  const loadSession = async () => {
    setIsCheckingSession(true);

    try {
      const token = await Promise.race([
        getAuthToken(),
        new Promise<null>((resolve) => {
          window.setTimeout(() => resolve(null), 8_000);
        }),
      ]);

      if (!token) {
        setIsAuthenticated(false);
        setSummary(null);
        return;
      }

      const data = await fetchAdminJson<{ authenticated: boolean }>(
        "/api/auth/session",
      );
      setIsAuthenticated(data.authenticated);

      if (!data.authenticated) {
        setSummary(null);
      }
    } catch {
      setIsAuthenticated(false);
      setSummary(null);
    } finally {
      setIsCheckingSession(false);
    }
  };

  const loadSummary = async () => {
    setSummaryError(null);

    try {
      const data = await fetchAdminJson<OwnerSummary>("/api/summary");
      setSummary(data);
    } catch (error) {
      setSummaryError(
        error instanceof Error ? error.message : "Unable to load overview.",
      );
    } finally {
      setSummaryLoaded(true);
    }
  };

  useEffect(() => {
    void loadSession();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      void loadSummary();
    } else {
      setSummary(null);
      setSummaryLoaded(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) {
      setHasUnsavedChanges(false);
      return;
    }

    const main = document.getElementById("main-content");
    if (!main) {
      return;
    }

    const markDirty = (event: Event) => {
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        setHasUnsavedChanges(true);
      }
    };

    main.addEventListener("input", markDirty);
    main.addEventListener("change", markDirty);

    return () => {
      main.removeEventListener("input", markDirty);
      main.removeEventListener("change", markDirty);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (isOnline && isAuthenticated) {
      void loadSummary();
    }
  }, [isOnline, isAuthenticated]);

  const handleLogout = async () => {
    await authClient.signOut();
    setSummary(null);
    setSummaryLoaded(false);
    await loadSession();
    navigate("/admin", { replace: true });
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-dvh bg-background text-ink">
        <AppTopBar isAuthenticated={false} />
        <main id="main-content" className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="vn-skeleton h-72 w-full rounded-md" />
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-dvh bg-background text-ink">
        <main id="main-content">
          <AdminLogin onAuthenticated={loadSession} />
        </main>
      </div>
    );
  }

  const renderRoute = () => {
    switch (route.name) {
      case "entry":
      case "overview":
        return (
          <OverviewPage
            summary={summary}
            summaryLoaded={summaryLoaded}
            summaryError={summaryError}
            onNavigate={navigate}
          />
        );
      case "products":
        return (
          <ProductsPage
            initialProductId={route.productId}
            onNavigate={navigate}
            onStatsChange={() => {
              void loadSummary();
            }}
          />
        );
      case "customers":
        return (
          <CustomerManager
            onStatsChange={() => {
              void loadSummary();
            }}
          />
        );
      case "product-price-history":
        return (
          <ProductPriceHistoryPage
            productId={route.productId}
            onNavigate={navigate}
          />
        );
      case "customer-ledger":
        return (
          <RoutePlaceholderPage
            title="Customer ledger"
            description="Dedicated ledger views arrive in a later phase."
            onNavigate={navigate}
            fallbackHref="/admin/customers"
            fallbackLabel="Back to customers"
          />
        );
      case "record-purchase":
        return (
          <RoutePlaceholderPage
            title="Record purchase"
            description="Dedicated purchase flows arrive in a later phase."
            onNavigate={navigate}
            fallbackHref="/admin/customers"
            fallbackLabel="Open customers"
          />
        );
      case "record-payment":
        return (
          <RoutePlaceholderPage
            title="Record payment"
            description="Dedicated payment flows arrive in a later phase."
            onNavigate={navigate}
            fallbackHref="/admin/customers"
            fallbackLabel="Open customers"
          />
        );
      case "not-found":
        return (
          <AdminNotFoundPage
            requestedPath={route.requestedPath}
            onNavigate={navigate}
          />
        );
      default: {
        const _exhaustive: never = route;
        return _exhaustive;
      }
    }
  };

  return (
    <>
      <AdminShell
        route={route}
        isOnline={isOnline}
        onNavigate={navigate}
        onLogout={() => {
          void handleLogout();
        }}
        mainClassName={!isOnline ? "pointer-events-none opacity-80" : undefined}
        offlineBanner={
          !isOnline ? (
            <p
              className="border-b border-hairline bg-surface-soft px-4 py-2 text-center text-xs font-medium text-muted-text"
              role="status"
            >
              Offline — store data and saves need an internet connection.
            </p>
          ) : null
        }
      >
        <div aria-busy={!isOnline}>{renderRoute()}</div>
      </AdminShell>

      <PwaUpdatePrompt
        needRefresh={needRefresh && !updateDismissed}
        hasUnsavedChanges={hasUnsavedChanges}
        onDismiss={() => setUpdateDismissed(true)}
        onUpdate={() => updateServiceWorker(true)}
      />
    </>
  );
};
