import { useEffect, useState } from "react";

import { authClient, getAuthToken } from "@/lib/auth/client";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchAdminJson } from "@/lib/client/api";

import { AdminLogin } from "./AdminLogin";
import { CustomerManager } from "./CustomerManager";
import { ProductManager } from "./ProductManager";
import { AppTopBar } from "./AppTopBar";

export const AdminConsole = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

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

  useEffect(() => {
    void loadSession();
  }, []);

  const handleLogout = async () => {
    await authClient.signOut();
    await loadSession();
  };

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-ia-surface text-ia-on-surface">
        <AppTopBar isAuthenticated={false} />
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <div className="p-8 text-sm text-ia-secondary bg-ia-surface-card rounded-md border border-ia-outline-variant">
            Checking session...
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-ia-surface text-ia-on-surface">
        <AppTopBar isAuthenticated={false} />
        <div className="mx-auto max-w-md px-4 py-12 sm:px-6">
          <AdminLogin onAuthenticated={loadSession} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ia-surface text-ia-on-surface">
      <AppTopBar isAuthenticated={true} onLogout={handleLogout} />
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-6">
        {/* Redesigned Dashboard Header Card */}
        <header className="flex flex-col gap-4 rounded-md border border-ia-outline-variant bg-ia-surface-card p-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold tracking-[-0.6px] text-ia-on-surface">
                  Workspace Operations
                </h1>
                <Badge className="rounded-[4px] ia-chip-orange text-[10px] px-2 py-0.5 font-medium uppercase font-mono border-0 hover:bg-orange-100 dark:hover:bg-orange-900/30">
                  Admin Console
                </Badge>
              </div>
              <p className="text-xs text-ia-secondary">
                Maintain product catalog prices, view price logs, and manage customer credit running ledgers.
              </p>
            </div>
          </div>
        </header>

        {/* Tabs Selector Redesigned to Industrial Atelier style */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="flex gap-2 bg-transparent p-0 border-b border-ia-outline-variant rounded-none h-auto pb-1.5 mb-6 w-full justify-start">
            <TabsTrigger 
              value="products" 
              className="rounded-[4px] px-4 py-2 text-xs font-semibold tracking-tight transition-all data-[state=active]:bg-ia-primary-container data-[state=active]:text-ia-on-primary text-ia-secondary hover:bg-ia-surface-high hover:text-ia-on-surface cursor-pointer"
            >
              Products Catalog
            </TabsTrigger>
            <TabsTrigger 
              value="customers" 
              className="rounded-[4px] px-4 py-2 text-xs font-semibold tracking-tight transition-all data-[state=active]:bg-ia-primary-container data-[state=active]:text-ia-on-primary text-ia-secondary hover:bg-ia-surface-high hover:text-ia-on-surface cursor-pointer"
            >
              Customers and Ledger
            </TabsTrigger>
          </TabsList>
          <TabsContent value="products" className="focus-visible:outline-none">
            <ProductManager />
          </TabsContent>
          <TabsContent value="customers" className="focus-visible:outline-none">
            <CustomerManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
