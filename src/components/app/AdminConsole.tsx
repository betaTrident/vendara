import { useEffect, useState } from "react";

import { authClient, getAuthToken } from "@/lib/auth/client";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchAdminJson } from "@/lib/client/api";

import { AdminLogin } from "./AdminLogin";
import { CustomerManager } from "./CustomerManager";
import { ProductManager } from "./ProductManager";
import { AppTopBar } from "./AppTopBar";
import { Package, Users, AlertCircle } from "lucide-react";
import type { Customer, Product } from "@/lib/types";

// ── Stat card components ──────────────────────────────────────────────────────
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
  <div className="vn-card p-5 flex flex-col justify-between min-h-[120px]">
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-1.5 min-w-0">
        <p className="text-[10px] text-muted-text font-semibold uppercase tracking-wider font-sans">
          {label}
        </p>
        <div className="flex items-center gap-2">
          <p
            className={`text-2xl font-semibold tracking-tight tabular-nums leading-none ${
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
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-surface-soft text-ink border border-hairline">
        <Icon className="size-5" />
      </div>
    </div>
  </div>
);

// ── Skeleton stat card ───────────────────────────────────────────────────────
const StatCardSkeleton = () => (
  <div className="vn-card p-5 space-y-4 min-h-[120px]">
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

// ── Tab trigger class ────────────────────────────────────────────────────────
const TAB_TRIGGER_CLASS =
  "relative rounded-none px-4 py-3 text-sm font-semibold transition-all text-muted-text hover:text-ink cursor-pointer shadow-none border-b-2 border-transparent " +
  "data-[state=active]:text-primary data-[state=active]:border-primary " +
  "focus-visible:outline-none";

// ── AdminConsole ─────────────────────────────────────────────────────────────
export const AdminConsole = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [statsData, setStatsData] = useState<{
    productCount: number;
    customerCount: number;
    totalOutstanding: number;
    settledCount: number;
    statsLoaded: boolean;
  }>({
    productCount: 0,
    customerCount: 0,
    totalOutstanding: 0,
    settledCount: 0,
    statsLoaded: false,
  });

  const loadSession = async () => {
    setIsCheckingSession(true);

    try {
      const token = await getAuthToken();

      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      const data = await fetchAdminJson<{ authenticated: boolean }>("/api/auth/session");
      setIsAuthenticated(data.authenticated);
    } catch {
      setIsAuthenticated(false);
    } finally {
      setIsCheckingSession(false);
    }
  };

  const loadStats = async () => {
    try {
      const [products, customers] = await Promise.all([
        fetchAdminJson<Product[]>("/api/products"),
        fetchAdminJson<Customer[]>("/api/customers"),
      ]);
      const totalOutstanding = customers.reduce((sum, c) => sum + (c.balance ?? 0), 0);
      const settledCount = customers.filter((c) => (c.balance ?? 0) === 0).length;
      setStatsData({
        productCount: products.length,
        customerCount: customers.length,
        totalOutstanding,
        settledCount,
        statsLoaded: true,
      });
    } catch {
      setStatsData((prev) => ({ ...prev, statsLoaded: true }));
    }
  };

  useEffect(() => {
    void loadSession();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      void loadStats();
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await authClient.signOut();
    await loadSession();
  };

  // ── Checking session (full-page skeleton) ──────────────────────────────────
  if (isCheckingSession) {
    return (
      <div className="min-h-dvh bg-background text-ink">
        <AppTopBar isAuthenticated={false} />
        <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
          <div className="h-12 flex flex-col gap-2">
            <div className="vn-skeleton h-5 w-48" />
            <div className="vn-skeleton h-3 w-72" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
          <div className="vn-skeleton h-10 w-56 rounded-sm" />
          <div className="vn-skeleton h-72 w-full rounded-md" />
        </main>
      </div>
    );
  }

  // ── Not authenticated → show login ─────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-dvh bg-background text-ink">
        <AdminLogin onAuthenticated={loadSession} />
      </div>
    );
  }

  // ── Authenticated console ──────────────────────────────────────────────────
  return (
    <div className="min-h-dvh bg-background text-ink">
      <AppTopBar isAuthenticated={true} onLogout={handleLogout} />

      <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">

        {/* ── Page header ── */}
        <header className="space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-ink font-heading">
              Workspace Operations
            </h1>
            <Badge className="rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] px-2.5 py-0.5 font-semibold">
              Admin
            </Badge>
          </div>
          <p className="text-sm text-muted-text">
            Manage product catalog, customer accounts, and credit ledgers.
          </p>
        </header>

        {/* ── KPI stat cards ── */}
        <div className="grid gap-4 sm:grid-cols-3">
          {!statsData.statsLoaded ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                label="Products in catalog"
                value={statsData.productCount}
                sub={statsData.productCount === 1 ? "item tracked" : "items tracked"}
                icon={Package}
              />
              <StatCard
                label="Customer accounts"
                value={statsData.customerCount}
                sub={`${statsData.settledCount} settled · ${statsData.customerCount - statsData.settledCount} outstanding`}
                icon={Users}
              />
              <StatCard
                label="Total credit outstanding"
                value={`₱${statsData.totalOutstanding.toFixed(2)}`}
                sub={
                  statsData.totalOutstanding > 0
                    ? "across active accounts"
                    : "all accounts settled"
                }
                icon={AlertCircle}
                accent={statsData.totalOutstanding > 0 ? "error" : "default"}
              />
            </>
          )}
        </div>

        {/* ── Tabs ── */}
        <Tabs defaultValue="products" className="space-y-0">
          <TabsList
            className="flex gap-6 border-b border-hairline p-0 rounded-none h-auto w-full justify-start bg-transparent"
            id="admin-tab-list"
          >
            <TabsTrigger
              id="tab-products"
              value="products"
              className={TAB_TRIGGER_CLASS}
            >
              Products catalog
            </TabsTrigger>
            <TabsTrigger
              id="tab-customers"
              value="customers"
              className={TAB_TRIGGER_CLASS}
            >
              Customers &amp; ledger
            </TabsTrigger>
          </TabsList>

          <div className="pt-6">
            <TabsContent value="products" className="focus-visible:outline-none mt-0">
              <ProductManager
                onStatsChange={(count) =>
                  setStatsData((prev) => ({ ...prev, productCount: count }))
                }
              />
            </TabsContent>
            <TabsContent value="customers" className="focus-visible:outline-none mt-0">
              <CustomerManager
                onStatsChange={(customerCount, totalOutstanding, settledCount) =>
                  setStatsData((prev) => ({ ...prev, customerCount, totalOutstanding, settledCount }))
                }
              />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
};
