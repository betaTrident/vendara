import { useEffect, useState, useMemo } from "react";
import { Plus, Trash2, Calendar, DollarSign, ShoppingBag, CreditCard, ChevronRight, User, AlertCircle, RefreshCw } from "lucide-react";

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
  }, [customer?.id]);

  // Dynamic Debt Subtotal Calculation for the Itemized Builder
  const debtSubtotal = useMemo(() => {
    return debtRows.reduce((sum, row) => {
      const product = products.find((p) => p.id === row.productId);
      const qty = Number(row.quantity) || 0;
      return sum + (product ? product.sellingPrice * qty : 0);
    }, 0);
  }, [debtRows, products]);

  if (!customer) {
    return (
      <Card className="rounded-[8px] border border-ia-outline-variant bg-ia-surface-card p-8 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ia-surface border border-ia-outline-variant text-ia-secondary mb-4">
          <User className="size-5 text-ia-secondary" />
        </div>
        <h3 className="text-base font-semibold text-ia-on-surface">Select a customer</h3>
        <p className="text-sm text-ia-secondary mt-2 max-w-sm mx-auto">
          Choose a customer from the directory to review transaction statements, record credits, or post payments.
        </p>
      </Card>
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
    <div className="space-y-6">
      {/* Running Credit Statement Banner */}
      <Card className="rounded-[8px] border border-ia-outline-variant bg-ia-surface-card overflow-hidden shadow-sm">
        <div className="p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-bold tracking-wider text-ia-secondary uppercase">Account profile</span>
            <h2 className="text-2xl font-semibold tracking-[-0.6px] text-ia-on-surface">{customer.name}</h2>
            {customer.note ? (
              <p className="text-xs text-ia-secondary italic mt-1 font-medium">"{customer.note}"</p>
            ) : (
              <p className="text-xs text-ia-secondary/70 mt-1">No registration notes saved.</p>
            )}
          </div>
          <div className="sm:text-right shrink-0">
            <span className="text-[10px] font-mono font-bold tracking-wider text-ia-secondary uppercase block mb-1">Running Credit Balance</span>
            <div className="flex items-baseline gap-1 sm:justify-end">
              <span className={`text-3xl font-semibold tracking-[-0.8px] font-mono ${customer.balance > 0 ? "text-ia-error" : "text-ia-on-surface"}`}>
                ₱{customer.balance.toFixed(2)}
              </span>
            </div>
            {customer.balance > 0 ? (
              <span className="text-[10px] font-medium ia-chip-red px-2 py-0.5 rounded-[4px] inline-block mt-1.5 border-0 hover:bg-red-100">
                Outstanding Credit
              </span>
            ) : (
              <span className="text-[10px] font-medium text-ia-secondary bg-ia-surface border border-ia-outline-variant px-2 py-0.5 rounded-[4px] inline-block mt-1.5">
                Account Settled
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Date Configuration Toolbar */}
      <div className="flex items-center gap-3 rounded-[4px] border border-ia-outline-variant bg-ia-surface p-3.5">
        <Calendar className="size-4.5 text-ia-secondary shrink-0" />
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <Label htmlFor="entry-date" className="text-xs font-semibold text-ia-secondary">Configure Posting Date</Label>
          <Input
            id="entry-date"
            type="date"
            value={entryDate}
            onChange={(event) => setEntryDate(event.target.value)}
            className="h-8.5 rounded-[4px] border border-ia-outline bg-ia-surface-card text-xs font-medium focus-visible:ring-2 focus-visible:ring-ia-primary-container/20 w-full sm:w-44 text-center cursor-pointer text-ia-on-surface"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 items-start">
        {/* Itemized Credit/Debt Builder */}
        <Card className="rounded-[8px] border border-ia-outline-variant bg-ia-surface-card overflow-hidden shadow-sm">
          <CardHeader className="ia-well">
            <CardTitle className="font-heading text-sm font-semibold tracking-tight text-ia-on-surface flex items-center gap-2">
              <ShoppingBag className="size-4 text-ia-secondary" />
              <span>Log Credit Purchase</span>
            </CardTitle>
            <CardDescription className="text-xs text-ia-secondary mt-0.5">
              Add products to customer's outstanding balance sheet.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-3">
              {debtRows.map((row, index) => {
                const product = products.find((p) => p.id === row.productId);
                const lineTotal = product ? product.sellingPrice * Number(row.quantity) : 0;
                
                return (
                  <div key={index} className="flex flex-col gap-2 p-3 rounded-[4px] border border-ia-outline bg-ia-surface relative">
                    <div className="grid gap-2.5 grid-cols-[1fr_80px]">
                      <select
                        className="h-9.5 text-xs rounded-[4px] border border-ia-outline bg-ia-surface-card px-2.5 text-ia-on-surface focus:outline-none focus:border-ia-primary-container focus:ring-1 focus:ring-ia-primary-container"
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
                      >
                        <option value="">Select product...</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} (₱{p.sellingPrice.toFixed(2)})
                          </option>
                        ))}
                      </select>
                      
                      <Input
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
                        className="h-9.5 rounded-[4px] border border-ia-outline bg-ia-surface-card text-xs font-mono text-center text-ia-on-surface"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-ia-secondary font-mono">
                        {product ? `₱${product.sellingPrice.toFixed(2)} each` : "Choose a product"}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-ia-on-surface font-mono">
                          ₱{lineTotal.toFixed(2)}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleRemoveRow(index)}
                          className="h-6 w-6 p-0 border border-ia-outline bg-ia-surface-card hover:bg-ia-surface hover:text-ia-error text-ia-secondary rounded-[4px] transition-colors cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="size-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDebtRows((current) => [...current, emptyDebtRow])}
                className="h-8.5 rounded-[4px] border border-ia-outline bg-ia-surface-card hover:bg-ia-surface hover:text-ia-on-surface text-ia-secondary text-xs font-semibold transition-colors cursor-pointer flex-1"
              >
                <Plus className="size-3.5 mr-1" />
                Add Item Row
              </Button>
            </div>

            {/* Subtotal Cost Summary */}
            {debtSubtotal > 0 ? (
              <div className="rounded-[4px] bg-ia-surface border border-ia-outline-variant p-3 flex items-center justify-between text-xs font-medium">
                <span className="text-ia-secondary uppercase tracking-wider text-[10px] font-mono font-bold">Statement Subtotal</span>
                <span className="text-ia-on-surface text-sm font-semibold font-mono">₱{debtSubtotal.toFixed(2)}</span>
              </div>
            ) : null}

            <div className="space-y-1.5">
              <Label htmlFor="debt-note" className="text-xs font-semibold text-ia-secondary">Credit Memo</Label>
              <Textarea
                id="debt-note"
                placeholder="Optional purchase details..."
                value={debtNote}
                onChange={(event) => setDebtNote(event.target.value)}
                className="min-h-16 rounded-[4px] border border-ia-outline bg-ia-surface text-xs text-ia-on-surface placeholder:text-ia-secondary/50 focus-visible:ring-2 focus-visible:ring-ia-primary-container/20 focus-visible:border-ia-primary-container w-full resize-none p-2.5"
              />
            </div>

            <Button
              type="button"
              onClick={() => void handleCreateDebt()}
              disabled={isSubmitting || debtSubtotal === 0}
              className="h-9.5 w-full rounded-[4px] bg-ia-primary-container text-ia-on-primary font-semibold text-xs transition-colors hover:bg-ia-primary shadow-sm cursor-pointer"
            >
              Post Credit Statement
            </Button>
          </CardContent>
        </Card>

        {/* Record Client Payment */}
        <Card className="rounded-[8px] border border-ia-outline-variant bg-ia-surface-card overflow-hidden shadow-sm">
          <CardHeader className="ia-well">
            <CardTitle className="font-heading text-sm font-semibold tracking-tight text-ia-on-surface flex items-center gap-2">
              <CreditCard className="size-4 text-ia-secondary" />
              <span>Record Client Payment</span>
            </CardTitle>
            <CardDescription className="text-xs text-ia-secondary mt-0.5">
              Credit payment received to reduce outstanding balance.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="payment-amount" className="text-xs font-semibold text-ia-secondary">Payment Amount (₱)</Label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-ia-secondary/60 text-xs font-medium">₱</span>
                <Input
                  id="payment-amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(event) => setPaymentAmount(event.target.value)}
                  className="h-10 pl-7 rounded-[4px] border border-ia-outline bg-ia-surface text-sm text-ia-on-surface placeholder:text-ia-secondary/50 focus-visible:ring-2 focus-visible:ring-ia-primary-container/20 focus-visible:border-ia-primary-container w-full"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="payment-note" className="text-xs font-semibold text-ia-secondary">Payment Memo</Label>
              <Textarea
                id="payment-note"
                placeholder="Reference details, GCash reference code, or note..."
                value={paymentNote}
                onChange={(event) => setPaymentNote(event.target.value)}
                className="min-h-16 rounded-[4px] border border-ia-outline bg-ia-surface text-xs text-ia-on-surface placeholder:text-ia-secondary/50 focus-visible:ring-2 focus-visible:ring-ia-primary-container/20 focus-visible:border-ia-primary-container w-full resize-none p-2.5"
              />
            </div>

            <Button
              type="button"
              onClick={() => void handleCreatePayment()}
              disabled={isSubmitting || !paymentAmount}
              className="h-9.5 w-full rounded-[4px] bg-ia-primary-container text-ia-on-primary font-semibold text-xs transition-colors hover:bg-ia-primary shadow-sm cursor-pointer"
            >
              Post Payment Record
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Ledger History Chronological Timeline */}
      <Card className="rounded-[8px] border border-ia-outline-variant bg-ia-surface-card overflow-hidden shadow-sm">
        <CardHeader className="ia-well">
          <CardTitle className="font-heading text-sm font-semibold tracking-tight text-ia-on-surface flex items-center gap-2">
            <RefreshCw className="size-4 text-ia-secondary" />
            <span>Ledger History Statements</span>
          </CardTitle>
          <CardDescription className="text-xs text-ia-secondary mt-0.5">
            Detailed ledger entries, transactions, and running balances in order.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-ia-surface-high border-b border-ia-outline-variant">
                <TableRow className="hover:bg-transparent border-b border-ia-outline-variant">
                  <TableHead className="ia-label py-2 px-4 h-9">Date</TableHead>
                  <TableHead className="ia-label py-2 px-4 h-9">Type</TableHead>
                  <TableHead className="ia-label py-2 px-4 h-9">Statement Details</TableHead>
                  <TableHead className="ia-label py-2 px-4 h-9">Running Balance</TableHead>
                  <TableHead className="ia-label py-2 px-4 h-9 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledger.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-xs text-ia-secondary">
                      No transactions recorded for this account profile yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  ledger.map((entry) => {
                    const isPayment = entry.entryType === "payment";
                    
                    return (
                      <TableRow key={entry.id} className="hover:bg-ia-surface-low border-b border-ia-outline-variant transition-colors">
                        <TableCell className="py-3.5 px-4 font-mono text-xs text-ia-secondary whitespace-nowrap">
                          {entry.entryDate}
                        </TableCell>
                        <TableCell className="py-3.5 px-4">
                          {isPayment ? (
                            <Badge className="rounded-[4px] ia-chip-green border-0 text-[10px] font-mono px-2.5 py-0.5 hover:bg-green-100 dark:hover:bg-green-900/30">
                              Payment
                            </Badge>
                          ) : (
                            <Badge className="rounded-[4px] ia-chip-orange border-0 text-[10px] font-mono px-2.5 py-0.5 hover:bg-orange-100 dark:hover:bg-orange-900/30">
                              Purchase
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-3.5 px-4">
                          {isPayment ? (
                            <div className="space-y-1">
                              <p className="text-sm font-semibold font-mono text-ia-primary">
                                -₱{(entry.paymentAmount ?? 0).toFixed(2)}
                              </p>
                              {entry.note ? (
                                <p className="text-xs text-ia-secondary italic leading-relaxed">
                                  "{entry.note}"
                                </p>
                              ) : null}
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <p className="text-sm font-semibold font-mono text-ia-on-surface">
                                +₱{(entry.totalAmount ?? 0).toFixed(2)}
                              </p>
                              {entry.items && entry.items.length > 0 ? (
                                <div className="flex flex-col gap-1 rounded-[4px] border border-ia-outline-variant bg-ia-surface/50 p-2">
                                  {entry.items.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between text-xs gap-3">
                                      <span className="text-ia-secondary font-medium">{item.productNameSnapshot}</span>
                                      <span className="text-ia-secondary/70 font-mono shrink-0">
                                        ₱{item.unitSellingPriceSnapshot.toFixed(2)} × {item.quantity}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : null}
                              {entry.note ? (
                                <p className="text-xs text-ia-secondary italic leading-relaxed">
                                  "{entry.note}"
                                </p>
                              ) : null}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="py-3.5 px-4 font-mono text-xs font-semibold text-ia-on-surface">
                          ₱{(entry.runningBalance ?? 0).toFixed(2)}
                        </TableCell>
                        <TableCell className="py-3.5 px-4 text-right">
                          <Button
                            variant="destructive"
                            size="xs"
                            onClick={() => void handleDeleteEntry(entry.id)}
                            className="h-7 w-7 p-0 border-0 bg-ia-error-container/30 text-ia-error hover:bg-ia-error-container/60 hover:text-ia-error rounded-[4px] transition-colors cursor-pointer"
                            title="Delete entry"
                          >
                            <Trash2 className="size-3" />
                          </Button>
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
  );
};
