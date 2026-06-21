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

// ── Stat card component ──────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  accent?: "default" | "error";
  index?: number;
}

const StatCard = ({
  label,
  value,
  sub,
  icon: Icon,
  accent = "default",
  index = 0,
}: StatCardProps) => (
  <div
    className={`ia-bezel-outer ia-slide-up ia-stagger-${index + 1} ia-spring-hover group`}
  >
    <div className={`ia-bezel-inner p-5 h-full ${accent === "error" ? "bg-red-50/10 border-red-200/50" : "bg-white"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <p className="ia-label text-[10px] text-ia-secondary font-bold uppercase tracking-wider font-sans">{label}</p>
          <p
            className={`text-3xl font-bold tracking-tight font-mono tabular-nums leading-none ${
              accent === "error" ? "text-ia-error" : "text-ia-on-surface"
            }`}
          >
            {value}
          </p>
          {sub && (
            <p className="text-[11px] text-ia-secondary/85 font-semibold leading-relaxed mt-1">{sub}</p>
          )}
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border transition-all duration-350 group-hover:scale-110 ${
            accent === "error"
              ? "bg-red-50 text-ia-error border-red-150"
              : "bg-ia-surface text-ia-secondary border-ia-outline-variant"
          }`}
        >
          <Icon className="size-5" />
        </div>
      </div>
    </div>
  </div>
);

// ── Skeleton stat card ───────────────────────────────────────────────────────
const StatCardSkeleton = ({ index = 0 }: { index?: number }) => (
  <div className={`ia-bezel-outer ia-fade-in ia-stagger-${index + 1}`}>
    <div className="ia-bezel-inner p-5 bg-white space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-3 flex-1">
          <div className="ia-skeleton h-3 w-24 rounded" />
          <div className="ia-skeleton h-7 w-20 rounded" />
          <div className="ia-skeleton h-3 w-28 rounded" />
        </div>
        <div className="ia-skeleton h-11 w-11 rounded-lg" />
      </div>
    </div>
  </div>
);

// ── Tab trigger class ────────────────────────────────────────────────────────
const TAB_TRIGGER_CLASS =
  "relative rounded-lg px-6 py-2.5 text-xs font-bold tracking-normal transition-all duration-300 text-ia-secondary hover:text-ia-on-surface cursor-pointer shadow-none border-0 " +
  "data-[state=active]:text-ia-on-primary data-[state=active]:bg-ia-primary-container data-[state=active]:shadow-sm " +
  "active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ia-primary-container/20";

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
      <div className="min-h-dvh bg-ia-surface text-ia-on-surface">
        <AppTopBar isAuthenticated={false} />
        <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
          <div className="h-12 flex flex-col gap-2">
            <div className="ia-skeleton h-5 w-48 rounded" />
            <div className="ia-skeleton h-3 w-72 rounded" />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCardSkeleton index={0} />
            <StatCardSkeleton index={1} />
            <StatCardSkeleton index={2} />
          </div>
          <div className="ia-skeleton h-10 w-56 rounded-md" />
          <div className="ia-skeleton h-72 w-full rounded-lg" />
        </main>
      </div>
    );
  }

  // ── Not authenticated → show login ─────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-dvh bg-ia-surface text-ia-on-surface">
        <AdminLogin onAuthenticated={loadSession} />
      </div>
    );
  }

  // ── Authenticated console ──────────────────────────────────────────────────
  return (
    <div className="min-h-dvh bg-ia-surface text-ia-on-surface">
      <AppTopBar isAuthenticated={true} onLogout={handleLogout} />

      <main id="main-content" className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">

        {/* ── Page header ── */}
        <header className="ia-fade-in space-y-1">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-ia-on-surface">
              Workspace Operations
            </h1>
            <Badge className="rounded-[4px] ia-chip-orange text-[10px] px-2 py-0.5 font-bold uppercase font-mono tracking-wider border-0">
              Admin
            </Badge>
          </div>
          <p className="text-sm text-ia-secondary leading-relaxed">
            Manage product catalog, customer accounts, and credit ledgers.
          </p>
        </header>

        {/* ── KPI stat cards ── */}
        <div className="grid gap-4 sm:grid-cols-3">
          {!statsData.statsLoaded ? (
            <>
              <StatCardSkeleton index={0} />
              <StatCardSkeleton index={1} />
              <StatCardSkeleton index={2} />
            </>
          ) : (
            <>
              <StatCard
                index={0}
                label="Products in catalog"
                value={statsData.productCount}
                sub={statsData.productCount === 1 ? "item tracked" : "items tracked"}
                icon={Package}
              />
              <StatCard
                index={1}
                label="Customer accounts"
                value={statsData.customerCount}
                sub={`${statsData.settledCount} settled · ${statsData.customerCount - statsData.settledCount} outstanding`}
                icon={Users}
              />
              <StatCard
                index={2}
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
            className="flex gap-1.5 bg-ia-surface-low border border-ia-outline-variant/60 p-1 rounded-xl h-auto w-max justify-start"
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
