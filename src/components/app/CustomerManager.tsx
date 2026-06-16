import { useEffect, useMemo, useState } from "react";
import { Plus, Edit2, Trash2, ChevronRight, Users } from "lucide-react";

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

// ── Initials avatar helper ────────────────────────────────────────────────────
const AVATAR_PALETTE = [
  { bg: "#FFF3EE", text: "#b02f00" },
  { bg: "#EFF6FF", text: "#1d4ed8" },
  { bg: "#F0FDF4", text: "#15803d" },
  { bg: "#FDF4FF", text: "#7e22ce" },
  { bg: "#FFFBEB", text: "#b45309" },
  { bg: "#F0F9FF", text: "#0369a1" },
];

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getAvatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
};

interface CustomerManagerProps {
  onStatsChange?: (customerCount: number, totalOutstanding: number, settledCount: number) => void;
}

export const CustomerManager = ({ onStatsChange }: CustomerManagerProps) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [form, setForm] = useState(emptyCustomerForm);
  const [isSaving, setIsSaving] = useState(false);

  const loadCustomers = async () => {
    const data = await fetchAdminJson<Customer[]>("/api/customers");
    setCustomers(data);
    const totalOutstanding = data.reduce((sum, c) => sum + (c.balance ?? 0), 0);
    const settledCount = data.filter((c) => (c.balance ?? 0) === 0).length;
    onStatsChange?.(data.length, totalOutstanding, settledCount);
  };

  useEffect(() => {
    void loadCustomers();
    void fetchJson<Product[]>("/api/products").then(setProducts);
  }, []);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId],
  );

  const totalOutstanding = useMemo(
    () => customers.reduce((sum, c) => sum + (c.balance ?? 0), 0),
    [customers],
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
      <div className="space-y-4">

        {/* Customer Form */}
        <Card className="rounded-lg border border-ia-outline-variant bg-ia-surface-card overflow-hidden shadow-sm">
          <CardHeader className="ia-well">
            <CardTitle className="font-heading text-sm font-semibold tracking-tight text-ia-on-surface flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-ia-primary-container text-ia-on-primary font-mono text-[11px] font-bold">
                {form.id ? "E" : "+"}
              </span>
              <span>{form.id ? "Edit customer record" : "Register new customer"}</span>
            </CardTitle>
            <CardDescription className="text-xs text-ia-secondary mt-0.5">
              Register clients to track store credits and outstanding balances.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4" id="customer-form">
              <div className="space-y-1.5">
                <Label htmlFor="customer-name" className="text-xs font-semibold text-ia-secondary">
                  Customer name
                </Label>
                <Input
                  id="customer-name"
                  placeholder="e.g. Aling Nena"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  className="h-10 rounded-md border border-ia-outline-variant bg-ia-surface text-sm text-ia-on-surface placeholder:text-ia-secondary/40 focus-visible:ring-1 focus-visible:ring-ia-primary-container focus-visible:border-ia-primary-container w-full transition-colors"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="customer-note" className="text-xs font-semibold text-ia-secondary">
                  Note <span className="font-normal text-ia-secondary/60">(optional)</span>
                </Label>
                <Textarea
                  id="customer-note"
                  placeholder="Contact details, address, or special notes..."
                  value={form.note}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, note: event.target.value }))
                  }
                  className="min-h-[72px] rounded-md border border-ia-outline-variant bg-ia-surface text-sm text-ia-on-surface placeholder:text-ia-secondary/40 focus-visible:ring-1 focus-visible:ring-ia-primary-container focus-visible:border-ia-primary-container w-full resize-none p-3 transition-colors"
                />
              </div>

              <div className="flex gap-2.5 pt-1">
                <Button
                  id="customer-submit-btn"
                  type="submit"
                  disabled={isSaving}
                  className="h-9 px-4 rounded-md bg-ia-primary-container text-ia-on-primary font-semibold text-xs transition-all hover:bg-ia-primary active:scale-[0.97] shadow-sm cursor-pointer flex-1"
                >
                  {isSaving ? "Saving..." : form.id ? "Update profile" : "Register profile"}
                </Button>
                {form.id ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setForm(emptyCustomerForm)}
                    className="h-9 px-4 rounded-md border border-ia-outline-variant bg-ia-surface-card hover:bg-ia-surface text-ia-secondary text-xs font-semibold transition-colors cursor-pointer flex-1"
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Accounts Directory */}
        <Card className="rounded-lg border border-ia-outline-variant bg-ia-surface-card overflow-hidden shadow-sm">
          <CardHeader className="ia-well">
            <CardTitle className="font-heading text-sm font-semibold tracking-tight text-ia-on-surface flex items-center gap-2">
              <Users className="size-4 text-ia-secondary" />
              Accounts directory
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
                    <TableHead className="ia-label py-2 px-4 h-9">Balance</TableHead>
                    <TableHead className="ia-label py-2 px-4 h-9 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {customers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="py-14 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ia-surface border border-ia-outline-variant text-ia-secondary">
                            <Users className="size-5" />
                          </div>
                          <p className="text-xs font-semibold text-ia-on-surface">No accounts yet</p>
                          <p className="text-xs text-ia-secondary">Register a customer above to get started.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    customers.map((customer) => {
                      const hasCredit = customer.balance > 0;
                      const isSelected = selectedCustomerId === customer.id;
                      const avatarColor = getAvatarColor(customer.name);
                      const initials = getInitials(customer.name);

                      return (
                        <TableRow
                          key={customer.id}
                          id={`customer-row-${customer.id}`}
                          className={`border-b border-ia-outline-variant transition-colors cursor-pointer relative ${
                            isSelected
                              ? "bg-orange-50/60 hover:bg-orange-50/80"
                              : "hover:bg-ia-surface-low/50"
                          }`}
                          onClick={() => setSelectedCustomerId(customer.id)}
                        >
                          {/* Left accent bar on selected */}
                          {isSelected && (
                            <td
                              aria-hidden="true"
                              className="absolute left-0 top-0 bottom-0 w-[2px] bg-ia-primary-container rounded-r-sm p-0 border-0"
                            />
                          )}

                          <TableCell className="py-3 px-4 pl-5">
                            <div className="flex items-center gap-2.5">
                              {/* Initials avatar */}
                              <div
                                className="ia-avatar rounded-md text-[11px]"
                                style={{ background: avatarColor.bg, color: avatarColor.text }}
                              >
                                {initials}
                              </div>
                              <div>
                                <div className="font-semibold text-ia-on-surface text-sm leading-snug">
                                  {customer.name}
                                </div>
                                {customer.note ? (
                                  <div className="text-[11px] text-ia-secondary line-clamp-1 mt-0.5 leading-relaxed">
                                    {customer.note}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          </TableCell>

                          <TableCell className="py-3 px-4">
                            {hasCredit ? (
                              <div className="flex items-center gap-1.5">
                                <span className="ia-pulse-dot" />
                                <Badge className="rounded-md ia-chip-red text-xs font-semibold font-mono px-2 py-0.5 tabular-nums">
                                  ₱{customer.balance.toFixed(2)}
                                </Badge>
                              </div>
                            ) : (
                              <Badge className="rounded-md bg-ia-surface border border-ia-outline-variant text-ia-secondary hover:bg-ia-surface text-xs font-medium font-mono px-2 py-0.5">
                                Settled
                              </Badge>
                            )}
                          </TableCell>

                          <TableCell className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="inline-flex gap-1">
                              <Button
                                id={`ledger-btn-${customer.id}`}
                                variant="outline"
                                size="xs"
                                onClick={() => setSelectedCustomerId(customer.id)}
                                className={`h-7 px-2.5 text-[10px] font-semibold border rounded-md transition-all cursor-pointer flex items-center gap-1 ${
                                  isSelected
                                    ? "bg-ia-primary-container border-ia-primary-container text-ia-on-primary hover:bg-ia-primary"
                                    : "border-ia-outline-variant bg-ia-surface-card hover:bg-ia-surface text-ia-secondary"
                                }`}
                              >
                                <span>Ledger</span>
                                <ChevronRight className="size-3" />
                              </Button>
                              <Button
                                id={`edit-customer-${customer.id}`}
                                variant="outline"
                                size="xs"
                                onClick={() =>
                                  setForm({
                                    id: customer.id,
                                    name: customer.name,
                                    note: customer.note ?? "",
                                  })
                                }
                                className="h-7 w-7 p-0 border border-ia-outline-variant bg-ia-surface-card hover:bg-ia-surface text-ia-secondary rounded-md transition-colors cursor-pointer"
                                title="Edit profile"
                              >
                                <Edit2 className="size-3" />
                              </Button>
                              <Button
                                id={`delete-customer-${customer.id}`}
                                variant="destructive"
                                size="xs"
                                onClick={() => void handleDelete(customer.id)}
                                className="h-7 w-7 p-0 border-0 bg-ia-error-container/20 text-ia-error hover:bg-ia-error-container/50 rounded-md transition-colors cursor-pointer"
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

            {/* Directory footer: summary */}
            {customers.length > 0 && (
              <div className="px-4 py-3 border-t border-ia-outline-variant bg-ia-surface-high flex items-center justify-between">
                <p className="text-[11px] text-ia-secondary font-mono">
                  {customers.length} account{customers.length !== 1 ? "s" : ""}
                </p>
                {totalOutstanding > 0 && (
                  <p className="text-[11px] font-mono font-semibold text-ia-error tabular-nums">
                    ₱{totalOutstanding.toFixed(2)} outstanding
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Ledger Panel */}
      <CustomerLedgerPanel
        customer={selectedCustomer}
        products={products}
        onCustomerMutated={loadCustomers}
      />
    </div>
  );
};
