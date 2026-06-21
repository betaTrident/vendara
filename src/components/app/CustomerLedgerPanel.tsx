import { useEffect, useState, useMemo } from "react";
import { Plus, Trash2, Calendar, ShoppingBag, CreditCard, User, RefreshCw, ChevronDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { fetchAdminJson } from "@/lib/client/api";
import type { Customer, LedgerEntry, Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CustomerLedgerPanelProps = {
  customer: Customer | null;
  products: Product[];
  onCustomerMutated: () => Promise<void> | void;
};

const emptyDebtRow = { productId: "", quantity: "1" };

export const CustomerLedgerPanel = ({
  customer,
  products,
  onCustomerMutated,
}: CustomerLedgerPanelProps) => {
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");
  const [debtNote, setDebtNote] = useState("");
  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [debtRows, setDebtRows] = useState([emptyDebtRow]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Accordion state
  const [isPurchaseOpen, setIsPurchaseOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const loadLedger = async () => {
    if (!customer) {
      setLedger([]);
      return;
    }

    try {
      const data = await fetchAdminJson<LedgerEntry[]>(`/api/customers/${customer.id}/ledger`);
      setLedger(data);
    } catch {
      setLedger([]);
    }
  };

  useEffect(() => {
    void loadLedger();
    setIsPurchaseOpen(false);
    setIsPaymentOpen(false);
  }, [customer?.id]);

  const debtSubtotal = useMemo(() => {
    return debtRows.reduce((sum, row) => {
      const product = products.find((p) => p.id === row.productId);
      const qty = Number(row.quantity) || 0;
      return sum + (product ? product.sellingPrice * qty : 0);
    }, 0);
  }, [debtRows, products]);

  // Ledger summary stats
  const ledgerSummary = useMemo(() => {
    let totalDebits = 0;
    let totalPayments = 0;
    for (const entry of ledger) {
      if (entry.entryType === "payment") {
        totalPayments += entry.paymentAmount ?? 0;
      } else {
        totalDebits += entry.totalAmount ?? 0;
      }
    }
    return { totalDebits, totalPayments };
  }, [ledger]);

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[440px] text-center p-8 ia-fade-in">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-ia-surface border border-ia-outline-variant text-ia-secondary mb-4 transition-transform duration-300 hover:scale-110">
          <User className="size-5 text-ia-secondary" />
        </div>
        <h3 className="text-sm font-bold text-ia-on-surface">Select a customer</h3>
        <p className="text-xs text-ia-secondary mt-2 max-w-xs mx-auto leading-relaxed">
          Choose a customer from the directory to review credit statements, log purchases, or record payments.
        </p>
      </div>
    );
  }

  const handleCreateDebt = async () => {
    const validRows = debtRows.filter((row) => row.productId && Number(row.quantity) > 0);
    if (validRows.length === 0) return;

    setIsSubmitting(true);
    try {
      await fetchAdminJson(`/api/customers/${customer.id}/ledger/debt`, {
        method: "POST",
        body: JSON.stringify({
          entryDate,
          note: debtNote || null,
          items: validRows.map((row) => ({
            productId: row.productId,
            quantity: Number(row.quantity),
          })),
        }),
      });

      setDebtRows([emptyDebtRow]);
      setDebtNote("");
      setIsPurchaseOpen(false);
      await loadLedger();
      await onCustomerMutated();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreatePayment = async () => {
    const amount = Number(paymentAmount);
    if (isNaN(amount) || amount <= 0) return;

    setIsSubmitting(true);
    try {
      await fetchAdminJson(`/api/customers/${customer.id}/ledger/payment`, {
        method: "POST",
        body: JSON.stringify({
          entryDate,
          paymentAmount: amount,
          note: paymentNote || null,
        }),
      });

      setPaymentAmount("");
      setPaymentNote("");
      setIsPaymentOpen(false);
      await loadLedger();
      await onCustomerMutated();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    try {
      await fetchAdminJson(`/api/ledger/${entryId}`, {
        method: "DELETE",
      });
      await loadLedger();
      await onCustomerMutated();
    } catch {
      // Keep state in sync
    }
  };

  const handleRemoveRow = (indexToRemove: number) => {
    if (debtRows.length <= 1) {
      setDebtRows([emptyDebtRow]);
    } else {
      setDebtRows((current) => current.filter((_, idx) => idx !== indexToRemove));
    }
  };

  return (
    <div className="space-y-5 ia-fade-in">

      {/* ── Account Profile Header Strip ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-ia-outline-variant">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-xl font-bold tracking-tight text-ia-on-surface">
              {customer.name}
            </h2>
            {customer.balance > 0 ? (
              <Badge className="rounded-md ia-chip-red text-[10px] font-mono px-2 py-0.5 font-bold">
                Outstanding
              </Badge>
            ) : (
              <Badge className="rounded-md ia-chip-green text-[10px] font-mono px-2 py-0.5 font-bold">
                Settled
              </Badge>
            )}
          </div>
          {customer.note ? (
            <p className="text-xs text-ia-secondary italic mt-1 leading-relaxed">
              "{customer.note}"
            </p>
          ) : (
            <p className="text-xs text-ia-secondary/50 mt-1">No notes on file</p>
          )}
        </div>

        <div className="ia-bezel-outer p-1 shrink-0 self-start sm:self-center">
          <div className="ia-bezel-inner bg-ia-surface-high py-2 px-3.5 flex items-center gap-3 select-none">
            <div className="text-right">
              <span className="ia-label block text-[9px] text-ia-secondary/70 leading-none mb-1">Running Credit Balance</span>
              <span className={`text-xl font-bold font-mono tabular-nums leading-none ${
                customer.balance > 0 ? "text-ia-error" : "text-ia-on-surface"
              }`}>
                ₱{customer.balance.toFixed(2)}
              </span>
            </div>
            {customer.balance > 0 ? (
              <span className="ia-pulse-dot" aria-hidden="true" />
            ) : (
              <div className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />
            )}
          </div>
        </div>
      </div>

      {/* ── Date Toolbar ── */}
      <div className="flex items-center gap-3 rounded-xl border border-ia-outline-variant bg-ia-surface p-3 transition-all">
        <Calendar className="size-4 text-ia-secondary shrink-0" aria-hidden="true" />
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <Label htmlFor="entry-date" className="text-xs font-bold text-ia-secondary uppercase tracking-wider">
            Posting / Transaction Date
          </Label>
          <Input
            id="entry-date"
            type="date"
            value={entryDate}
            onChange={(event) => setEntryDate(event.target.value)}
            className="h-8.5 px-3 rounded-lg border border-ia-outline-variant bg-white text-xs font-medium focus-visible:ring-2 focus-visible:ring-ia-primary-container/20 focus-visible:border-ia-primary-container w-full sm:w-48 text-center cursor-pointer text-ia-on-surface font-mono transition-all ia-focus-ring"
          />
        </div>
      </div>

      {/* ── Collapsible Transaction Forms ── */}
      <div className="grid gap-3">
        {/* Accordion 1: Log credit purchase */}
        <div className="rounded-xl border border-ia-outline-variant bg-ia-surface-card overflow-hidden transition-all duration-300 hover:border-ia-outline focus-within:ring-2 focus-within:ring-ia-primary-container/20">
          <button
            type="button"
            aria-expanded={isPurchaseOpen}
            onClick={() => {
              setIsPurchaseOpen(!isPurchaseOpen);
              if (!isPurchaseOpen) setIsPaymentOpen(false);
            }}
            className="w-full text-left flex items-center justify-between p-4 bg-ia-surface-card hover:bg-ia-surface-low/50 transition-colors cursor-pointer select-none outline-none"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-ia-surface border border-ia-outline-variant text-ia-secondary shrink-0">
                <ShoppingBag className="size-4" aria-hidden="true" />
              </div>
              <div>
                <span className="font-heading text-sm font-bold tracking-tight text-ia-on-surface">
                  Log credit purchase
                </span>
                <span className="text-[11px] text-ia-secondary mt-0.5 block font-normal leading-normal">
                  Add products to customer's outstanding balance
                </span>
              </div>
            </div>
            <div className={`p-1 rounded-md hover:bg-ia-surface transition-transform duration-300 ${isPurchaseOpen ? "rotate-180" : ""}`}>
              <ChevronDown className="size-4 text-ia-secondary shrink-0" aria-hidden="true" />
            </div>
          </button>

          {isPurchaseOpen && (
            <div className="p-5 space-y-4 border-t border-ia-outline-variant bg-ia-surface/30 ia-slide-up">
              <div className="space-y-2.5">
                {debtRows.map((row, index) => {
                  const product = products.find((p) => p.id === row.productId);
                  const lineTotal = product ? product.sellingPrice * Number(row.quantity) : 0;

                  return (
                    <div
                      key={index}
                      className="flex flex-col gap-2 p-3 rounded-lg border border-ia-outline-variant bg-white ia-slide-up"
                    >
                      <div className="grid gap-2 grid-cols-[1fr_80px]">
                        <select
                          id={`debt-product-${index}`}
                          className="h-10 text-xs rounded-lg border border-ia-outline-variant bg-white px-3 text-ia-on-surface transition-all cursor-pointer focus-visible:outline-none ia-focus-ring"
                          value={row.productId}
                          onChange={(event) =>
                            setDebtRows((current) =>
                              current.map((entry, entryIndex) =>
                                entryIndex === index
                                  ? { ...entry, productId: event.target.value }
                                  : entry,
                              ),
                            )
                          }
                          aria-label={`Select product for row ${index + 1}`}
                        >
                          <option value="">Select product...</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} — ₱{p.sellingPrice.toFixed(2)}
                            </option>
                          ))}
                        </select>

                        <Input
                          id={`debt-qty-${index}`}
                          type="number"
                          min="1"
                          placeholder="Qty"
                          value={row.quantity}
                          onChange={(event) =>
                            setDebtRows((current) =>
                              current.map((entry, entryIndex) =>
                                entryIndex === index
                                  ? { ...entry, quantity: event.target.value }
                                  : entry,
                              ),
                            )
                          }
                          className="h-10 rounded-lg border border-ia-outline-variant bg-white text-xs font-mono text-center text-ia-on-surface transition-all ia-focus-ring"
                          aria-label={`Quantity for row ${index + 1}`}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-0.5">
                        <span className="text-ia-secondary font-medium">
                          {product
                            ? `₱${product.sellingPrice.toFixed(2)} each`
                            : "Choose a product"}
                        </span>
                        <div className="flex items-center gap-2.5">
                          <span className="font-bold text-ia-on-surface font-mono tabular-nums">
                            ₱{lineTotal.toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(index)}
                            className="inline-flex h-7 w-7 items-center justify-center border border-ia-outline-variant bg-white hover:bg-red-50 hover:text-ia-error hover:border-red-200 text-ia-secondary rounded-lg transition-all duration-200 cursor-pointer active:scale-90"
                            title="Remove item"
                            aria-label={`Remove row ${index + 1}`}
                          >
                            <Trash2 className="size-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={() => setDebtRows((current) => [...current, emptyDebtRow])}
                className="h-9 rounded-lg border border-dashed border-ia-outline bg-transparent hover:bg-ia-surface hover:text-ia-on-surface text-ia-secondary text-xs font-bold transition-all active:scale-95 cursor-pointer w-full"
              >
                <Plus className="size-3.5 mr-1" aria-hidden="true" />
                Add item row
              </Button>

              {debtSubtotal > 0 && (
                <div className="rounded-xl bg-ia-surface border border-ia-outline-variant p-3.5 flex items-center justify-between ia-fade-in">
                  <span className="ia-label">Statement subtotal</span>
                  <span className="text-sm font-bold text-ia-on-surface font-mono tabular-nums">
                    ₱{debtSubtotal.toFixed(2)}
                  </span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="debt-note" className="text-xs font-bold text-ia-secondary">
                  Credit memo <span className="font-normal text-ia-secondary/60">(optional)</span>
                </Label>
                <Textarea
                  id="debt-note"
                  placeholder="Purchase details, or reference notes..."
                  value={debtNote}
                  onChange={(event) => setDebtNote(event.target.value)}
                  className="min-h-[72px] rounded-lg border border-ia-outline-variant bg-white text-xs text-ia-on-surface placeholder:text-ia-secondary/40 w-full resize-none p-2.5 transition-all ia-focus-ring"
                />
              </div>

              <Button
                id="post-debt-btn"
                type="button"
                onClick={() => void handleCreateDebt()}
                disabled={isSubmitting || debtSubtotal === 0}
                className="h-10 w-full rounded-lg bg-gradient-to-r from-ia-primary-container to-[#b02f00] text-ia-on-primary font-bold text-xs shadow-sm hover:shadow-md hover:brightness-105 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ia-primary-container/30"
              >
                {isSubmitting ? "Posting..." : "Post credit statement"}
              </Button>
            </div>
          )}
        </div>

        {/* Accordion 2: Record payment */}
        <div className="rounded-xl border border-ia-outline-variant bg-ia-surface-card overflow-hidden transition-all duration-300 hover:border-ia-outline focus-within:ring-2 focus-within:ring-ia-primary-container/20">
          <button
            type="button"
            aria-expanded={isPaymentOpen}
            onClick={() => {
              setIsPaymentOpen(!isPaymentOpen);
              if (!isPaymentOpen) setIsPurchaseOpen(false);
            }}
            className="w-full text-left flex items-center justify-between p-4 bg-ia-surface-card hover:bg-ia-surface-low/50 transition-colors cursor-pointer select-none outline-none"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-ia-surface border border-ia-outline-variant text-ia-secondary shrink-0">
                <CreditCard className="size-4" aria-hidden="true" />
              </div>
              <div>
                <span className="font-heading text-sm font-bold tracking-tight text-ia-on-surface">
                  Record payment
                </span>
                <span className="text-[11px] text-ia-secondary mt-0.5 block font-normal leading-normal">
                  Apply received payment to reduce outstanding balance
                </span>
              </div>
            </div>
            <div className={`p-1 rounded-md hover:bg-ia-surface transition-transform duration-300 ${isPaymentOpen ? "rotate-180" : ""}`}>
              <ChevronDown className="size-4 text-ia-secondary shrink-0" aria-hidden="true" />
            </div>
          </button>

          {isPaymentOpen && (
            <div className="p-5 space-y-4 border-t border-ia-outline-variant bg-ia-surface/30 ia-slide-up">
              <div className="space-y-1.5">
                <Label htmlFor="payment-amount" className="text-xs font-bold text-ia-secondary">
                  Payment amount
                </Label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-ia-secondary/50 text-xs font-semibold font-mono">₱</span>
                  <Input
                    id="payment-amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={paymentAmount}
                    onChange={(event) => setPaymentAmount(event.target.value)}
                    className="h-10 pl-7 rounded-lg border border-ia-outline-variant bg-white text-sm text-ia-on-surface font-mono placeholder:text-ia-secondary/40 transition-all ia-focus-ring"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="payment-note" className="text-xs font-bold text-ia-secondary">
                  Payment memo <span className="font-normal text-ia-secondary/60">(optional)</span>
                </Label>
                <Textarea
                  id="payment-note"
                  placeholder="GCash ref code, cash receipt, or other details..."
                  value={paymentNote}
                  onChange={(event) => setPaymentNote(event.target.value)}
                  className="min-h-[72px] rounded-lg border border-ia-outline-variant bg-white text-xs text-ia-on-surface placeholder:text-ia-secondary/40 w-full resize-none p-2.5 transition-all ia-focus-ring"
                />
              </div>

              <Button
                id="post-payment-btn"
                type="button"
                onClick={() => void handleCreatePayment()}
                disabled={isSubmitting || !paymentAmount}
                className="h-10 w-full rounded-lg bg-gradient-to-r from-ia-primary-container to-[#b02f00] text-ia-on-primary font-bold text-xs shadow-sm hover:shadow-md hover:brightness-105 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ia-primary-container/30"
              >
                {isSubmitting ? "Posting..." : "Post payment record"}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* ── Ledger History Table ── */}
      <div className="ia-bezel-outer">
        <div className="ia-bezel-inner bg-white overflow-hidden">
          <div className="ia-well flex items-center justify-between border-b border-ia-outline-variant px-5 py-4">
            <div>
              <p className="font-heading text-sm font-bold tracking-tight text-ia-on-surface flex items-center gap-2">
                <RefreshCw className="size-4 text-ia-secondary" aria-hidden="true" />
                Ledger history
              </p>
              <p className="text-[11px] text-ia-secondary mt-1 leading-normal">
                All transactions in chronological order with running balance.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[450px] overflow-y-auto relative">
            <Table>
              <TableHeader className="bg-ia-surface-high border-b border-ia-outline-variant sticky top-0 z-10">
                <TableRow className="hover:bg-transparent border-b border-ia-outline-variant bg-ia-surface-high">
                  <TableHead className="ia-label py-3 px-5 h-10 bg-ia-surface-high text-left">Date</TableHead>
                  <TableHead className="ia-label py-3 px-5 h-10 bg-ia-surface-high text-left">Type</TableHead>
                  <TableHead className="ia-label py-3 px-5 h-10 bg-ia-surface-high text-left">Details</TableHead>
                  <TableHead className="ia-label py-3 px-5 h-10 bg-ia-surface-high text-left">Balance</TableHead>
                  <TableHead className="ia-label py-3 px-5 h-10 text-right bg-ia-surface-high w-16"></TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {ledger.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-16 text-xs text-ia-secondary">
                      No transactions recorded for this account yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  ledger.map((entry, idx) => {
                    const isPayment = entry.entryType === "payment";
                    const isLast = idx === ledger.length - 1;

                    return (
                      <TableRow
                        key={entry.id}
                        className={`border-b border-ia-outline-variant/60 transition-all duration-200 ia-slide-up ia-stagger-${Math.min(idx + 1, 6)} hover:bg-ia-surface-low/30 ${
                          isLast ? "bg-ia-surface-overlay font-bold" : ""
                        }`}
                      >
                        <TableCell className="py-4 px-5 font-mono text-xs text-ia-secondary whitespace-nowrap tabular-nums">
                          {entry.entryDate}
                        </TableCell>

                        <TableCell className="py-4 px-5">
                          {isPayment ? (
                            <Badge className="rounded-md ia-chip-green text-[10px] font-mono px-2 py-0.5 font-bold">
                              Payment
                            </Badge>
                          ) : (
                            <Badge className="rounded-md ia-chip-orange text-[10px] font-mono px-2 py-0.5 font-bold">
                              Purchase
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="py-4 px-5 max-w-[240px]">
                          {isPayment ? (
                            <div className="space-y-1.5">
                              <p className="text-sm font-bold font-mono text-emerald-700 tabular-nums">
                                -₱{(entry.paymentAmount ?? 0).toFixed(2)}
                              </p>
                              {entry.note ? (
                                <p className="text-xs text-ia-secondary leading-relaxed bg-ia-surface/50 p-2 rounded border border-ia-outline-variant/50 max-w-xs">
                                  "{entry.note}"
                                </p>
                              ) : null}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-sm font-bold font-mono text-ia-on-surface tabular-nums">
                                +₱{(entry.totalAmount ?? 0).toFixed(2)}
                              </p>
                              {entry.items && entry.items.length > 0 ? (
                                <div className="flex flex-col gap-1 rounded-lg border border-ia-outline-variant bg-ia-surface/60 p-2.5 max-w-xs">
                                  {entry.items.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between text-[11px] gap-4">
                                      <span className="text-ia-secondary font-semibold truncate">
                                        {item.productNameSnapshot}
                                      </span>
                                      <span className="text-ia-secondary/70 font-mono shrink-0 tabular-nums">
                                        ₱{item.unitSellingPriceSnapshot.toFixed(2)} × {item.quantity}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                              {entry.note ? (
                                <p className="text-xs text-ia-secondary leading-relaxed bg-ia-surface/50 p-2 rounded border border-ia-outline-variant/50 max-w-xs">
                                  "{entry.note}"
                                </p>
                              ) : null}
                            </div>
                          )}
                        </TableCell>

                        <TableCell className={`py-4 px-5 font-mono text-xs tabular-nums ${
                          isLast ? "font-bold text-ia-on-surface text-sm" : "font-semibold text-ia-secondary"
                        }`}>
                          ₱{(entry.runningBalance ?? 0).toFixed(2)}
                        </TableCell>

                        <TableCell className="py-4 px-5 text-right">
                          <button
                            id={`delete-entry-${entry.id}`}
                            onClick={() => void handleDeleteEntry(entry.id)}
                            className="inline-flex h-7 w-7 items-center justify-center bg-ia-error-container/20 text-ia-error hover:bg-ia-error-container/50 rounded-lg transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/20 active:scale-90"
                            title="Delete entry"
                            aria-label="Delete entry"
                          >
                            <Trash2 className="size-3.5" aria-hidden="true" />
                          </button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Ledger summary footer */}
          {ledger.length > 0 && (
            <div className="px-5 py-4 border-t border-ia-outline-variant bg-ia-surface-high">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-[11px] text-ia-secondary font-mono">
                  {ledger.length} entr{ledger.length !== 1 ? "ies" : "y"} on record
                </p>
                <div className="flex items-center gap-5 flex-wrap">
                  <div className="text-[11px] font-mono">
                    <span className="text-ia-secondary">Total Debits: </span>
                    <span className="font-bold text-ia-on-surface tabular-nums">
                      ₱{ledgerSummary.totalDebits.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono">
                    <span className="text-ia-secondary">Total Payments: </span>
                    <span className="font-bold text-emerald-700 tabular-nums">
                      ₱{ledgerSummary.totalPayments.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono border-l border-ia-outline-variant/65 pl-4">
                    <span className="text-ia-secondary">Current Balance: </span>
                    <span className={`font-bold tabular-nums ${customer.balance > 0 ? "text-ia-error text-xs" : "text-ia-on-surface text-xs"}`}>
                      ₱{customer.balance.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
