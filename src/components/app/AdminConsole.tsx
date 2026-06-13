import { useEffect, useState } from "react";

import { authClient, getAuthToken } from "@/lib/auth/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchAdminJson } from "@/lib/client/api";

import { AdminLogin } from "./AdminLogin";
import { CustomerManager } from "./CustomerManager";
import { ProductManager } from "./ProductManager";

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
    return <div className="p-8 text-sm text-muted-foreground">Checking session...</div>;
  }

  if (!isAuthenticated) {
    return <AdminLogin onAuthenticated={loadSession} />;
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-sm md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <Badge className="rounded-full bg-amber-100 px-3 py-1 text-amber-900 hover:bg-amber-100">
            Vendara Control
          </Badge>
          <div>
            <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
              Pricing and customer ledger operations
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
              Maintain product prices, monitor price changes, and manage customer
              utang timelines from one operating view.
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => void handleLogout()}>
          Sign out
        </Button>
      </section>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="h-auto rounded-2xl p-1">
          <TabsTrigger value="products" className="rounded-xl">
            Products
          </TabsTrigger>
          <TabsTrigger value="customers" className="rounded-xl">
            Customers and Ledger
          </TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <ProductManager />
        </TabsContent>
        <TabsContent value="customers">
          <CustomerManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};
