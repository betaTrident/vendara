import { useEffect, useState } from "react";

import { authClient, getAuthToken } from "@/lib/auth/client";
import { fetchAdminJson } from "@/lib/client/api";
import type { OwnerSummary } from "@/lib/types";
import { usePwaState } from "@/lib/pwa/use-pwa-state";

import { AdminLogin } from "./AdminLogin";
import { AppTopBar } from "./AppTopBar";
import { PwaUpdatePrompt } from "./PwaUpdatePrompt";
import { ReconnectAnnouncement } from "./states/ReconnectAnnouncement";
import { ThemeProvider } from "./theme/ThemeProvider";
import { AdminShell } from "./layout/AdminShell";
import { useAdminRoute } from "./navigation/use-admin-route";
import { AdminNotFoundPage } from "./pages/AdminNotFoundPage";
import { CustomerLedgerPage } from "./pages/CustomerLedgerPage";
import { CustomersPage } from "./pages/CustomersPage";
import { OverviewPage } from "./pages/OverviewPage";
import { ProductPriceHistoryPage } from "./pages/ProductPriceHistoryPage";
import { ProductsPage } from "./pages/ProductsPage";
import { RecordPaymentPage } from "./pages/RecordPaymentPage";
import { RecordPurchasePage } from "./pages/RecordPurchasePage";

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
  const { isOnline, needRefresh, reconnected, acknowledgeReconnected, updateServiceWorker } =
    usePwaState();
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
        <main id="main-content" tabIndex={-1} className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="vn-skeleton h-72 w-full rounded-md" />
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-dvh bg-background text-ink">
        <main id="main-content" tabIndex={-1}>
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
          <CustomersPage
            initialCustomerId={route.customerId}
            onNavigate={navigate}
            onStatsChange={() => {
              void loadSummary();
            }}
          />
        );
      case "customer-ledger":
        return (
          <CustomerLedgerPage
            customerId={route.customerId}
            onNavigate={navigate}
          />
        );
      case "product-price-history":
        return (
          <ProductPriceHistoryPage
            productId={route.productId}
            onNavigate={navigate}
          />
        );
      case "record-purchase":
        return (
          <RecordPurchasePage
            initialCustomerId={route.customerId}
            isOnline={isOnline}
            onNavigate={navigate}
            onStatsChange={() => {
              void loadSummary();
            }}
          />
        );
      case "record-payment":
        return (
          <RecordPaymentPage
            initialCustomerId={route.customerId}
            isOnline={isOnline}
            onNavigate={navigate}
            onStatsChange={() => {
              void loadSummary();
            }}
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
          <>
            <ReconnectAnnouncement
              visible={reconnected}
              onDismiss={acknowledgeReconnected}
            />
            {!isOnline ? (
              <p
                className="border-b border-hairline bg-surface-soft px-4 py-2 text-center text-xs font-medium text-muted-text"
                role="status"
                aria-live="polite"
              >
                Offline — store data and saves need an internet connection.
              </p>
            ) : null}
          </>
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
