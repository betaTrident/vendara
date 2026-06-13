import { useEffect, useMemo, useState } from "react";
import { User, Plus, Edit2, Trash2, ChevronRight, UserCheck, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { fetchAdminJson, fetchJson } from "@/lib/client/api";
import type { Customer, Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

import { CustomerLedgerPanel } from "./CustomerLedgerPanel";

const emptyCustomerForm = {
  id: "",
  name: "",
  note: "",
};

export const CustomerManager = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [form, setForm] = useState(emptyCustomerForm);
  const [isSaving, setIsSaving] = useState(false);

  const loadCustomers = async () => {
    setCustomers(await fetchAdminJson<Customer[]>("/api/customers"));
  };

  useEffect(() => {
    void loadCustomers();
    void fetchJson<Product[]>("/api/products").then(setProducts);
  }, []);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        name: form.name,
        note: form.note || null,
      };

      if (form.id) {
        await fetchAdminJson(`/api/customers/${form.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await fetchAdminJson("/api/customers", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setForm(emptyCustomerForm);
      await loadCustomers();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (customerId: string) => {
    await fetchAdminJson(`/api/customers/${customerId}`, {
      method: "DELETE",
    });

    if (selectedCustomerId === customerId) {
      setSelectedCustomerId("");
    }

    await loadCustomers();
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] items-start">
      <div className="space-y-6">
        {/* Customer Form Creator */}
        <Card className="rounded-[8px] border border-ia-outline-variant bg-ia-surface-card overflow-hidden shadow-sm">
          <CardHeader className="ia-well">
            <CardTitle className="font-heading text-sm font-semibold tracking-tight text-ia-on-surface flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-[4px] bg-ia-primary-container text-ia-on-primary font-mono text-xs">
                {form.id ? "E" : "+"}
              </span>
              <span>{form.id ? "Edit Customer Record" : "Register New Customer"}</span>
            </CardTitle>
            <CardDescription className="text-xs text-ia-secondary mt-0.5">
              Register clients to keep track of store credits and payments.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="customer-name" className="text-xs font-semibold text-ia-secondary">Customer Name</Label>
                <Input
                  id="customer-name"
                  placeholder="e.g. Aling Nena"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  className="h-10 rounded-[4px] border border-ia-outline bg-ia-surface text-sm text-ia-on-surface placeholder:text-ia-secondary/50 focus-visible:ring-2 focus-visible:ring-ia-primary-container/20 focus-visible:border-ia-primary-container w-full"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="customer-note" className="text-xs font-semibold text-ia-secondary">Optional Note</Label>
                <Textarea
                  id="customer-note"
                  placeholder="e.g. Neighbor next door, contact details, or special requests..."
                  value={form.note}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, note: event.target.value }))
                  }
                  className="min-h-18 rounded-[4px] border border-ia-outline bg-ia-surface text-sm text-ia-on-surface placeholder:text-ia-secondary/50 focus-visible:ring-2 focus-visible:ring-ia-primary-container/20 focus-visible:border-ia-primary-container w-full resize-none p-3"
                />
              </div>
              <div className="flex gap-2.5 pt-2">
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="h-9 px-4 rounded-[4px] bg-ia-primary-container text-ia-on-primary font-semibold text-xs transition-colors hover:bg-ia-primary shadow-sm cursor-pointer flex-1"
                >
                  {isSaving ? "Saving..." : form.id ? "Update Profile" : "Register Profile"}
                </Button>
                {form.id ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setForm(emptyCustomerForm)}
                    className="h-9 px-4 rounded-[4px] border border-ia-outline bg-ia-surface-card hover:bg-ia-surface hover:text-ia-on-surface text-ia-secondary text-xs font-semibold transition-colors cursor-pointer flex-1"
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Customer Accounts Directory */}
        <Card className="rounded-[8px] border border-ia-outline-variant bg-ia-surface-card overflow-hidden shadow-sm">
          <CardHeader className="ia-well">
            <CardTitle className="font-heading text-sm font-semibold tracking-tight text-ia-on-surface">
              Accounts Directory
            </CardTitle>
            <CardDescription className="text-xs text-ia-secondary mt-0.5">
              Select an account to view credit statements and log transactions.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-ia-surface-high border-b border-ia-outline-variant">
                  <TableRow className="hover:bg-transparent border-b border-ia-outline-variant">
                    <TableHead className="ia-label py-2 px-4 h-9">Customer</TableHead>
                    <TableHead className="ia-label py-2 px-4 h-9">Credit Balance</TableHead>
                    <TableHead className="ia-label py-2 px-4 h-9 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-12 text-xs text-ia-secondary">
                        No customer accounts found. Catalog one above.
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((customer) => {
                      const hasCredit = customer.balance > 0;
                      const isSelected = selectedCustomerId === customer.id;
                      
                      return (
                        <TableRow 
                          key={customer.id} 
                          className={`border-b border-ia-outline-variant transition-colors cursor-pointer ${
                            isSelected 
                              ? "bg-ia-surface-high/80 hover:bg-ia-surface-high" 
                              : "hover:bg-ia-surface-low/40"
                          }`}
                          onClick={() => setSelectedCustomerId(customer.id)}
                        >
                          <TableCell className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                                isSelected 
                                  ? "bg-ia-primary-container border-ia-primary-container text-ia-on-primary" 
                                  : "bg-ia-surface border-ia-outline text-ia-secondary"
                              }`}>
                                <User className="size-3.5" />
                              </div>
                              <div>
                                <div className="font-semibold text-ia-on-surface text-sm leading-snug">{customer.name}</div>
                                {customer.note ? (
                                  <div className="text-[11px] text-ia-secondary line-clamp-1 mt-0.5">{customer.note}</div>
                                ) : null}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-3 px-4">
                            {hasCredit ? (
                              <Badge className="rounded-[4px] ia-chip-red border-0 text-xs font-semibold font-mono px-2 py-0.5 hover:bg-red-100 dark:hover:bg-red-900/30">
                                ₱{customer.balance.toFixed(2)}
                              </Badge>
                            ) : (
                              <Badge className="rounded-[4px] bg-ia-surface border border-ia-outline-variant text-ia-secondary hover:bg-ia-surface text-xs font-medium font-mono px-2 py-0.5">
                                Settled
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="inline-flex gap-1">
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() => setSelectedCustomerId(customer.id)}
                                className={`h-7 px-2.5 text-[10px] font-semibold border rounded-[4px] transition-all cursor-pointer flex items-center gap-1 ${
                                  isSelected 
                                    ? "bg-ia-primary-container border-ia-primary-container text-ia-on-primary hover:bg-ia-primary hover:text-ia-on-primary" 
                                    : "border-ia-outline bg-ia-surface-card hover:bg-ia-surface hover:text-ia-on-surface text-ia-secondary"
                                }`}
                              >
                                <span>Ledger</span>
                                <ChevronRight className="size-3" />
                              </Button>
                              <Button
                                variant="outline"
                                size="xs"
                                onClick={() =>
                                  setForm({
                                    id: customer.id,
                                    name: customer.name,
                                    note: customer.note ?? "",
                                  })
                                }
                                className="h-7 w-7 p-0 border border-ia-outline bg-ia-surface-card hover:bg-ia-surface hover:text-ia-on-surface text-ia-secondary rounded-[4px] transition-colors cursor-pointer"
                                title="Edit info"
                              >
                                <Edit2 className="size-3" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="xs"
                                onClick={() => void handleDelete(customer.id)}
                                className="h-7 w-7 p-0 border-0 bg-ia-error-container/30 text-ia-error hover:bg-ia-error-container/60 hover:text-ia-error rounded-[4px] transition-colors cursor-pointer"
                                title="Delete account"
                              >
                                <Trash2 className="size-3" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <CustomerLedgerPanel
        customer={selectedCustomer}
        products={products}
        onCustomerMutated={loadCustomers}
      />
    </div>
  );
};
