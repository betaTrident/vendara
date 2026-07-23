import { useEffect, useState } from "react";

import { authClient, getAuthToken } from "@/lib/auth/client";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchAdminJson } from "@/lib/client/api";
import type { OwnerSummary } from "@/lib/types";

import { AdminLogin } from "./AdminLogin";
import { CustomerManager } from "./CustomerManager";
import { ProductManager } from "./ProductManager";
import { AppTopBar } from "./AppTopBar";
import { PwaUpdatePrompt } from "./PwaUpdatePrompt";
import { Package, Users, AlertCircle } from "lucide-react";
import { usePwaState } from "@/lib/pwa/use-pwa-state";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  accent?: "default" | "error";
}

const StatCard = ({
  label,
  value,
  sub,
  icon: Icon,
  accent = "default",
}: StatCardProps) => (
  <div className="vn-card p-4 sm:p-5 flex flex-col justify-between min-h-[108px]">
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-1.5 min-w-0">
        <p className="text-[10px] text-muted-text font-semibold uppercase tracking-wider font-sans">
          {label}
        </p>
        <div className="flex items-center gap-2">
          <p
            className={`text-xl sm:text-2xl font-semibold tracking-tight tabular-nums leading-none ${
              accent === "error" ? "text-destructive" : "text-ink"
            }`}
          >
            {value}
          </p>
          {accent === "error" && (
            <span className="vn-pulse-dot" aria-label="Outstanding debt alert" />
          )}
        </div>
        {sub && (
          <p className="text-xs text-muted-text font-medium leading-relaxed mt-1">
            {sub}
          </p>
        )}
      </div>
      <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-sm bg-surface-soft text-ink border border-hairline">
        <Icon className="size-4 sm:size-5" />
      </div>
    </div>
  </div>
);

const StatCardSkeleton = () => (
  <div className="vn-card p-4 sm:p-5 space-y-4 min-h-[108px]">
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-3 flex-1">
        <div className="vn-skeleton h-3.5 w-24" />
        <div className="vn-skeleton h-7 w-20" />
        <div className="vn-skeleton h-3 w-28" />
      </div>
      <div className="vn-skeleton h-10 w-10 rounded-sm" />
    </div>
  </div>
);

const TAB_TRIGGER_CLASS =
  "relative rounded-none px-3 sm:px-4 py-3 text-sm font-semibold transition-all text-muted-text hover:text-ink cursor-pointer shadow-none border-b-2 border-transparent " +
  "data-[state=active]:text-primary data-[state=active]:border-primary " +
  "focus-visible:outline-none";

export const AdminConsole = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [summary, setSummary] = useState<OwnerSummary | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summaryLoaded, setSummaryLoaded] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [updateDismissed, setUpdateDismissed] = useState(false);
  const { isOnline, needRefresh, updateServiceWorker } = usePwaState();

  const loadSession = async () => {
    setIsCheckingSession(true);

    try {
      const token = await getAuthToken();

      if (!token) {
        setIsAuthenticated(false);
        setSummary(null);
        return;
      }

      const data = await fetchAdminJson<{ authenticated: boolean }>("/api/auth/session");
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
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-dvh bg-background text-ink">
        <AppTopBar isAuthenticated={false} />
        <main id="main-content" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
          <div className="vn-skeleton h-72 w-full rounded-md" />
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-dvh bg-background text-ink">
        <AdminLogin onAuthenticated={loadSession} />
      </div>
    );
  }

  const settledCount = summary
    ? summary.customerCount - summary.customersWithBalanceCount
    : 0;

  return (
    <div className="min-h-dvh bg-background text-ink pb-safe">
      <AppTopBar
        isAuthenticated={true}
        isOnline={isOnline}
        onLogout={handleLogout}
      />

      {!isOnline && (
        <p
          className="border-b border-hairline bg-surface-soft px-4 py-2 text-center text-xs font-medium text-muted-text"
          role="status"
        >
          Offline — store data and saves need an internet connection.
        </p>
      )}

      <main
        id="main-content"
        className={`relative mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-5 sm:space-y-6 ${
          !isOnline ? "pointer-events-none opacity-80" : ""
        }`}
        aria-busy={!isOnline}
      >
        <header className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-ink font-heading">
              Vendara
            </h1>
            <Badge className="rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] px-2.5 py-0.5 font-semibold">
              Owner
            </Badge>
          </div>
          <p className="text-sm text-muted-text">
            Products, customers, and credit ledger in one place.
          </p>
        </header>

        {summaryError && (
          <p className="text-sm text-destructive" role="alert">
            {summaryError}
          </p>
        )}

        <div className="grid gap-3 sm:gap-4 sm:grid-cols-3">
          {!summaryLoaded || !summary ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                label="Active products"
                value={summary.activeProductCount}
                sub="in your price list"
                icon={Package}
              />
              <StatCard
                label="Customers with balance"
                value={summary.customersWithBalanceCount}
                sub={`${settledCount} settled · ${summary.customerCount} total`}
                icon={Users}
              />
              <StatCard
                label="Total outstanding"
                value={`₱${summary.totalOutstanding.toFixed(2)}`}
                sub={
                  summary.totalOutstanding > 0
                    ? "across customer accounts"
                    : "all accounts settled"
                }
                icon={AlertCircle}
                accent={summary.totalOutstanding > 0 ? "error" : "default"}
              />
            </>
          )}
        </div>

        <Tabs defaultValue="customers" className="space-y-0">
          <TabsList
            className="flex gap-4 sm:gap-6 border-b border-hairline p-0 rounded-none h-auto w-full justify-start bg-transparent"
            id="admin-tab-list"
          >
            <TabsTrigger id="tab-products" value="products" className={TAB_TRIGGER_CLASS}>
              Products
            </TabsTrigger>
            <TabsTrigger id="tab-customers" value="customers" className={TAB_TRIGGER_CLASS}>
              Customers
            </TabsTrigger>
          </TabsList>

          <div className="pt-5 sm:pt-6">
            <TabsContent value="products" className="focus-visible:outline-none mt-0">
              <ProductManager
                onStatsChange={() => {
                  void loadSummary();
                }}
              />
            </TabsContent>
            <TabsContent value="customers" className="focus-visible:outline-none mt-0">
              <CustomerManager
                onStatsChange={() => {
                  void loadSummary();
                }}
              />
            </TabsContent>
          </div>
        </Tabs>
      </main>

      <PwaUpdatePrompt
        needRefresh={needRefresh && !updateDismissed}
        hasUnsavedChanges={hasUnsavedChanges}
        onDismiss={() => setUpdateDismissed(true)}
        onUpdate={() => updateServiceWorker(true)}
      />
    </div>
  );
};
