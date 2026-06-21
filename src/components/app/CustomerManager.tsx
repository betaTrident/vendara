import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  ArrowLeft,
  CheckCircle2,
  Search,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fetchAdminJson, fetchJson } from "@/lib/client/api";
import type { Customer, Product } from "@/lib/types";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

import { CustomerLedgerPanel } from "./CustomerLedgerPanel";

const emptyCustomerForm = { id: "", name: "", note: "" };

// ── Initials avatar helper ─────────────────────────────────────────────────────
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
  const [customerSearch, setCustomerSearch] = useState("");
  // Mobile: "list" | "detail"
  const [mobileView, setMobileView] = useState<"list" | "detail">("list");
  const [showAddForm, setShowAddForm] = useState(false);

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

  useEffect(() => {
    if (form.id) setShowAddForm(true);
  }, [form.id]);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId],
  );

  const filteredCustomers = useMemo(
    () =>
      customerSearch
        ? customers.filter((c) =>
            c.name.toLowerCase().includes(customerSearch.toLowerCase()),
          )
        : customers,
    [customers, customerSearch],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const payload = { name: form.name, note: form.note || null };

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
      setShowAddForm(false);
      await loadCustomers();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (customerId: string) => {
    await fetchAdminJson(`/api/customers/${customerId}`, { method: "DELETE" });
    if (selectedCustomerId === customerId) {
      setSelectedCustomerId("");
      setMobileView("list");
    }
    await loadCustomers();
  };

  const selectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    setMobileView("detail");
  };

  return (
    <div className="space-y-4">

      {/* ── Toolbar ── */}
      <div className="ia-toolbar">
        <div className="ia-toolbar__left">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ia-secondary/50 pointer-events-none" aria-hidden="true" />
            <Input
              id="customer-search"
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
              placeholder="Search customers..."
              className="h-9 pl-8 pr-8 rounded-lg border border-ia-outline-variant bg-ia-surface-card text-sm placeholder:text-ia-secondary/55 focus-visible:ring-2 focus-visible:ring-ia-primary-container/20 focus-visible:border-ia-primary-container transition-all ia-focus-ring"
              aria-label="Search customers"
            />
            {customerSearch && (
              <button
                onClick={() => setCustomerSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ia-secondary/40 hover:text-ia-secondary transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>
        <div className="ia-toolbar__right">
          <Button
            id="add-customer-btn"
            type="button"
            onClick={() => {
              setForm(emptyCustomerForm);
              setShowAddForm((prev) => !prev);
            }}
            className="h-9 px-4 rounded-lg bg-gradient-to-r from-ia-primary-container to-[#b02f00] text-ia-on-primary font-bold text-xs shadow-sm hover:shadow-md hover:brightness-105 active:scale-95 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ia-primary-container/30"
          >
            <Plus className="size-3.5 mr-1.5" aria-hidden="true" />
            {showAddForm && !form.id ? "Cancel" : "Add customer"}
          </Button>
        </div>
      </div>

      {/* ── Add / Edit form ── */}
      {(showAddForm || form.id) && (
        <div className="ia-bezel-outer ia-slide-up">
          <div className="ia-bezel-inner bg-white overflow-hidden">
            <div className="ia-well border-b border-ia-outline-variant px-5 py-3.5 flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-ia-on-surface flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-md bg-ia-primary-container text-ia-on-primary font-mono text-[10px] font-bold">
                    {form.id ? "E" : "+"}
                  </span>
                  {form.id ? "Edit customer record" : "Register new customer"}
                </p>
                <p className="text-[11px] text-ia-secondary mt-1 leading-normal">
                  Register clients to track store credits and outstanding balances.
                </p>
              </div>
            </div>

            <div className="p-5">
              <form onSubmit={handleSubmit} className="grid sm:grid-cols-[1fr_1fr_auto] gap-4 items-end" id="customer-form">
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
                    className="h-10 rounded-lg border border-ia-outline-variant bg-ia-surface text-sm text-ia-on-surface placeholder:text-ia-secondary/40 focus-visible:ring-2 focus-visible:ring-ia-primary-container/20 focus-visible:border-ia-primary-container w-full transition-all ia-focus-ring"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="customer-note" className="text-xs font-semibold text-ia-secondary">
                    Note <span className="font-normal text-ia-secondary/60">(optional)</span>
                  </Label>
                  <Textarea
                    id="customer-note"
                    placeholder="Contact details, address..."
                    value={form.note}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, note: event.target.value }))
                    }
                    className="h-10 min-h-0 rounded-lg border border-ia-outline-variant bg-ia-surface text-sm text-ia-on-surface placeholder:text-ia-secondary/40 focus-visible:ring-2 focus-visible:ring-ia-primary-container/20 focus-visible:border-ia-primary-container w-full resize-none p-2.5 transition-all ia-focus-ring"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    id="customer-submit-btn"
                    type="submit"
                    disabled={isSaving}
                    className="h-10 px-4 rounded-lg bg-gradient-to-r from-ia-primary-container to-[#b02f00] text-ia-on-primary font-bold text-xs shadow-sm hover:shadow-md hover:brightness-105 active:scale-95 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ia-primary-container/30"
                  >
                    {isSaving ? "Saving..." : form.id ? "Update" : "Register"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setForm(emptyCustomerForm); setShowAddForm(false); }}
                    className="h-10 px-3 rounded-lg border border-ia-outline-variant bg-ia-surface-low hover:bg-ia-surface-high text-ia-secondary text-xs font-bold transition-all active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ia-primary-container/20"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── Asymmetric Bento Layout Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start w-full">

        {/* ── Left panel: customer list ── */}
        <div
          className={`ia-bezel-outer ${mobileView === "detail" ? "hidden lg:block" : "block w-full"}`}
        >
          <div className="ia-bezel-inner bg-white overflow-hidden max-h-[680px] flex flex-col">
            {/* List header */}
            <div className="ia-well flex items-center justify-between gap-2 border-b border-ia-outline-variant px-5 py-4">
              <div>
                <p className="ia-label text-[10px] text-ia-secondary font-bold uppercase tracking-wider font-sans">Accounts</p>
                <p className="text-xs font-bold text-ia-on-surface mt-1">
                  {customers.length} customer{customers.length !== 1 ? "s" : ""}
                </p>
              </div>
              {customers.some((c) => (c.balance ?? 0) > 0) && (
                <span className="ia-pulse-dot" aria-label="Outstanding balances" />
              )}
            </div>

            {/* Customer list */}
            <div className="flex-1 overflow-y-auto divide-y divide-ia-outline-variant/50">
              {customers.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 px-4 text-center ia-fade-in">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ia-surface border border-ia-outline-variant text-ia-secondary">
                    <Users className="size-5" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-ia-on-surface">No accounts yet</p>
                    <p className="text-[11px] text-ia-secondary mt-1">
                      Add a customer to get started.
                    </p>
                  </div>
                </div>
              ) : filteredCustomers.length === 0 ? (
                <div className="px-4 py-12 text-center text-xs text-ia-secondary">
                  No customers match "<span className="font-semibold text-ia-on-surface">{customerSearch}</span>"
                </div>
              ) : (
                filteredCustomers.map((customer) => {
                  const hasCredit = customer.balance > 0;
                  const isActive = selectedCustomerId === customer.id;
                  const avatarColor = getAvatarColor(customer.name);
                  const initials = getInitials(customer.name);

                  return (
                    <div
                      key={customer.id}
                      id={`customer-item-${customer.id}`}
                      className={`flex items-center justify-between p-3.5 cursor-pointer relative transition-all duration-300 border-l-2 select-none group ${
                        isActive
                          ? "bg-ia-surface-overlay border-ia-primary-container"
                          : "border-transparent hover:bg-ia-surface-low/50"
                      }`}
                      onClick={() => selectCustomer(customer.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && selectCustomer(customer.id)}
                      aria-pressed={isActive}
                      aria-label={`${customer.name}, ${hasCredit ? `₱${customer.balance.toFixed(2)} outstanding` : "settled"}`}
                    >
                      {/* Avatar + name */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div
                          className="ia-avatar rounded-lg text-[10px] shrink-0 w-8 h-8 font-bold flex items-center justify-center transition-all duration-300 group-hover:scale-105"
                          style={{ background: avatarColor.bg, color: avatarColor.text }}
                          aria-hidden="true"
                        >
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-sm font-semibold truncate leading-snug transition-colors ${
                            isActive ? "text-ia-on-surface" : "text-ia-on-surface/90"
                          }`}>
                            {customer.name}
                          </p>
                          {customer.note && (
                            <p className="text-[11px] text-ia-secondary truncate mt-0.5 leading-relaxed">
                              {customer.note}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Balance + actions */}
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        {hasCredit ? (
                          <div className="flex items-center gap-1">
                            <span className="ia-pulse-dot" aria-hidden="true" />
                            <Badge className="rounded-md ia-chip-red text-[10px] font-bold font-mono px-1.5 py-0.5 tabular-nums">
                              ₱{customer.balance.toFixed(2)}
                            </Badge>
                          </div>
                        ) : (
                          <CheckCircle2 className="size-4 text-emerald-500" aria-label="Settled" />
                        )}

                        {/* Inline actions on hover */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={(e) => e.stopPropagation()}>
                          <button
                            id={`edit-customer-${customer.id}`}
                            onClick={() =>
                              setForm({
                                id: customer.id,
                                name: customer.name,
                                note: customer.note ?? "",
                              })
                            }
                            className="flex h-6.5 w-6.5 items-center justify-center rounded-lg border border-ia-outline-variant bg-white hover:bg-ia-surface-high text-ia-secondary hover:text-ia-on-surface transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ia-primary-container/20 active:scale-90"
                            title="Edit profile"
                            aria-label={`Edit ${customer.name}`}
                          >
                            <Edit2 className="size-3" aria-hidden="true" />
                          </button>
                          <button
                            id={`delete-customer-${customer.id}`}
                            onClick={() => void handleDelete(customer.id)}
                            className="flex h-6.5 w-6.5 items-center justify-center rounded-lg bg-ia-error-container/25 text-ia-error hover:bg-ia-error-container/55 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/20 active:scale-90"
                            title="Delete account"
                            aria-label={`Delete ${customer.name}`}
                          >
                            <Trash2 className="size-3" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* List footer */}
            {customers.length > 0 && (
              <div className="px-5 py-3 border-t border-ia-outline-variant bg-ia-surface-high flex items-center justify-between">
                <p className="text-[11px] text-ia-secondary font-mono">
                  {filteredCustomers.length} of {customers.length}
                </p>
                {customers.some((c) => c.balance > 0) && (
                  <p className="text-[11px] font-mono font-bold text-ia-error tabular-nums">
                    ₱{customers.reduce((s, c) => s + c.balance, 0).toFixed(2)} total
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Right panel: ledger detail ── */}
        <div
          className={`ia-bezel-outer ${mobileView === "list" ? "hidden lg:block" : "block w-full flex-1"}`}
        >
          <div className="ia-bezel-inner bg-white p-5 min-h-[500px]">
            {/* Mobile back button */}
            {mobileView === "detail" && (
              <div className="lg:hidden border-b border-ia-outline-variant pb-4 mb-4">
                <button
                  onClick={() => { setMobileView("list"); setSelectedCustomerId(""); }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-ia-secondary hover:text-ia-on-surface transition-all cursor-pointer active:scale-95"
                >
                  <ArrowLeft className="size-3.5" aria-hidden="true" />
                  Back to customers
                </button>
              </div>
            )}

            <CustomerLedgerPanel
              customer={selectedCustomer}
              products={products}
              onCustomerMutated={loadCustomers}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
