import { useEffect, useState, useMemo } from "react";
import { Plus, Trash2, Calendar, ShoppingBag, CreditCard, User, RefreshCw } from "lucide-react";

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
      <Card className="rounded-lg border border-ia-outline-variant bg-ia-surface-card p-10 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-ia-surface border border-ia-outline-variant text-ia-secondary mb-4">
          <User className="size-5 text-ia-secondary" />
        </div>
        <h3 className="text-sm font-semibold text-ia-on-surface">Select a customer</h3>
        <p className="text-xs text-ia-secondary mt-2 max-w-xs mx-auto leading-relaxed">
          Choose a customer from the directory to review credit statements, log purchases, or record payments.
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
    <div className="space-y-4 ia-fade-in">

      {/* ── Account Profile & Balance Banner ── */}
      <Card className="rounded-lg border border-ia-outline-variant bg-ia-surface-card overflow-hidden shadow-sm">
        <div
          className="p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5"
          style={customer.balance > 0 ? {} : undefined}
        >
          <div className="space-y-0.5">
            <span className="ia-label">Account profile</span>
            <h2 className="text-xl font-semibold tracking-[-0.4px] text-ia-on-surface mt-1">
              {customer.name}
            </h2>
            {customer.note ? (
              <p className="text-xs text-ia-secondary italic leading-relaxed">
                "{customer.note}"
              </p>
            ) : (
              <p className="text-xs text-ia-secondary/60">No notes on file.</p>
            )}
          </div>

          <div
            className={`sm:text-right shrink-0 rounded-lg p-4 sm:p-5 border ${
              customer.balance > 0
                ? "bg-red-50 border-red-100"
                : "bg-ia-surface border-ia-outline-variant"
            }`}
          >
            <span className="ia-label block mb-1">Running credit balance</span>
            <div className="flex items-baseline gap-1 sm:justify-end">
              <span
                className={`text-[1.75rem] font-semibold tracking-[-0.6px] font-mono tabular-nums leading-none ${
                  customer.balance > 0 ? "text-ia-error" : "text-ia-on-surface"
                }`}
              >
                ₱{customer.balance.toFixed(2)}
              </span>
            </div>
            {customer.balance > 0 ? (
              <div className="flex items-center gap-1.5 mt-1.5 sm:justify-end">
                <span className="ia-pulse-dot" />
                <span className="text-[10px] font-semibold text-ia-error font-mono">
                  Outstanding credit
                </span>
              </div>
            ) : (
              <span className="text-[10px] font-medium text-ia-secondary mt-1.5 inline-block">
                Account settled
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* ── Date Toolbar ── */}
      <div className="flex items-center gap-3 rounded-md border border-ia-outline-variant bg-ia-surface-card p-3.5">
        <Calendar className="size-4 text-ia-secondary shrink-0" />
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <Label htmlFor="entry-date" className="text-xs font-semibold text-ia-secondary">
            Posting date
          </Label>
          <Input
            id="entry-date"
            type="date"
            value={entryDate}
            onChange={(event) => setEntryDate(event.target.value)}
            className="h-8 rounded-md border border-ia-outline-variant bg-ia-surface text-xs font-medium focus-visible:ring-1 focus-visible:ring-ia-primary-container focus-visible:border-ia-primary-container w-full sm:w-44 text-center cursor-pointer text-ia-on-surface font-mono transition-colors"
          />
        </div>
      </div>

      {/* ── Transaction Entry Forms ── */}
      <div className="grid gap-4 sm:grid-cols-2 items-start">

        {/* Credit/Debt Builder */}
        <Card className="rounded-lg border border-ia-outline-variant bg-ia-surface-card overflow-hidden shadow-sm">
          <CardHeader className="ia-well">
            <CardTitle className="font-heading text-sm font-semibold tracking-tight text-ia-on-surface flex items-center gap-2">
              <ShoppingBag className="size-4 text-ia-secondary" />
              Log credit purchase
            </CardTitle>
            <CardDescription className="text-xs text-ia-secondary mt-0.5">
              Add products to customer's outstanding balance.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 space-y-4">
            <div className="space-y-2.5">
              {debtRows.map((row, index) => {
                const product = products.find((p) => p.id === row.productId);
                const lineTotal = product ? product.sellingPrice * Number(row.quantity) : 0;

                return (
                  <div
                    key={index}
                    className="flex flex-col gap-2 p-3 rounded-md border border-ia-outline-variant bg-ia-surface ia-slide-up"
                  >
                    <div className="grid gap-2 grid-cols-[1fr_76px]">
                      <select
                        id={`debt-product-${index}`}
                        className="h-9 text-xs rounded-md border border-ia-outline-variant bg-ia-surface-card px-2.5 text-ia-on-surface focus:outline-none focus:border-ia-primary-container focus:ring-1 focus:ring-ia-primary-container transition-colors"
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
                            {p.name} — ₱{p.sellingPrice.toFixed(2)}
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
                        className="h-9 rounded-md border border-ia-outline-variant bg-ia-surface-card text-xs font-mono text-center text-ia-on-surface focus-visible:ring-1 focus-visible:ring-ia-primary-container focus-visible:border-ia-primary-container transition-colors"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-0.5">
                      <span className="text-ia-secondary font-mono">
                        {product
                          ? `₱${product.sellingPrice.toFixed(2)} each`
                          : "Choose a product"}
                      </span>
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-ia-on-surface font-mono tabular-nums">
                          ₱{lineTotal.toFixed(2)}
                        </span>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleRemoveRow(index)}
                          className="h-6 w-6 p-0 border border-ia-outline-variant bg-ia-surface-card hover:bg-red-50 hover:text-ia-error hover:border-red-200 text-ia-secondary rounded-md transition-colors cursor-pointer"
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

            <Button
              type="button"
              variant="outline"
              onClick={() => setDebtRows((current) => [...current, emptyDebtRow])}
              className="h-8.5 rounded-md border border-dashed border-ia-outline bg-transparent hover:bg-ia-surface hover:text-ia-on-surface text-ia-secondary text-xs font-medium transition-colors cursor-pointer w-full"
            >
              <Plus className="size-3.5 mr-1" />
              Add item row
            </Button>

            {debtSubtotal > 0 && (
              <div className="rounded-md bg-ia-surface border border-ia-outline-variant p-3 flex items-center justify-between ia-fade-in">
                <span className="ia-label">Statement subtotal</span>
                <span className="text-sm font-semibold text-ia-on-surface font-mono tabular-nums">
                  ₱{debtSubtotal.toFixed(2)}
                </span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="debt-note" className="text-xs font-semibold text-ia-secondary">
                Credit memo <span className="font-normal text-ia-secondary/60">(optional)</span>
              </Label>
              <Textarea
                id="debt-note"
                placeholder="Purchase details, or reference notes..."
                value={debtNote}
                onChange={(event) => setDebtNote(event.target.value)}
                className="min-h-[60px] rounded-md border border-ia-outline-variant bg-ia-surface text-xs text-ia-on-surface placeholder:text-ia-secondary/40 focus-visible:ring-1 focus-visible:ring-ia-primary-container focus-visible:border-ia-primary-container w-full resize-none p-2.5 transition-colors"
              />
            </div>

            <Button
              id="post-debt-btn"
              type="button"
              onClick={() => void handleCreateDebt()}
              disabled={isSubmitting || debtSubtotal === 0}
              className="h-9 w-full rounded-md bg-ia-primary-container text-ia-on-primary font-semibold text-xs transition-all hover:bg-ia-primary active:scale-[0.97] shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Post credit statement
            </Button>
          </CardContent>
        </Card>

        {/* Payment Record */}
        <Card className="rounded-lg border border-ia-outline-variant bg-ia-surface-card overflow-hidden shadow-sm">
          <CardHeader className="ia-well">
            <CardTitle className="font-heading text-sm font-semibold tracking-tight text-ia-on-surface flex items-center gap-2">
              <CreditCard className="size-4 text-ia-secondary" />
              Record payment
            </CardTitle>
            <CardDescription className="text-xs text-ia-secondary mt-0.5">
              Apply received payment to reduce outstanding balance.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="payment-amount" className="text-xs font-semibold text-ia-secondary">
                Payment amount (₱)
              </Label>
              <div className="relative flex items-center">
                <span className="absolute left-3 text-ia-secondary/50 text-xs font-medium font-mono">₱</span>
                <Input
                  id="payment-amount"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(event) => setPaymentAmount(event.target.value)}
                  className="h-10 pl-7 rounded-md border border-ia-outline-variant bg-ia-surface text-sm text-ia-on-surface font-mono placeholder:text-ia-secondary/40 focus-visible:ring-1 focus-visible:ring-ia-primary-container focus-visible:border-ia-primary-container w-full transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="payment-note" className="text-xs font-semibold text-ia-secondary">
                Payment memo <span className="font-normal text-ia-secondary/60">(optional)</span>
              </Label>
              <Textarea
                id="payment-note"
                placeholder="GCash ref code, cash receipt, or other details..."
                value={paymentNote}
                onChange={(event) => setPaymentNote(event.target.value)}
                className="min-h-[72px] rounded-md border border-ia-outline-variant bg-ia-surface text-xs text-ia-on-surface placeholder:text-ia-secondary/40 focus-visible:ring-1 focus-visible:ring-ia-primary-container focus-visible:border-ia-primary-container w-full resize-none p-2.5 transition-colors"
              />
            </div>

            <Button
              id="post-payment-btn"
              type="button"
              onClick={() => void handleCreatePayment()}
              disabled={isSubmitting || !paymentAmount}
              className="h-9 w-full rounded-md bg-ia-primary-container text-ia-on-primary font-semibold text-xs transition-all hover:bg-ia-primary active:scale-[0.97] shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Post payment record
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* ── Ledger History Table ── */}
      <Card className="rounded-lg border border-ia-outline-variant bg-ia-surface-card overflow-hidden shadow-sm">
        <CardHeader className="ia-well">
          <CardTitle className="font-heading text-sm font-semibold tracking-tight text-ia-on-surface flex items-center gap-2">
            <RefreshCw className="size-4 text-ia-secondary" />
            Ledger history
          </CardTitle>
          <CardDescription className="text-xs text-ia-secondary mt-0.5">
            All transactions in chronological order with running balance.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-ia-surface-high border-b border-ia-outline-variant">
                <TableRow className="hover:bg-transparent border-b border-ia-outline-variant">
                  <TableHead className="ia-label py-2 px-4 h-9">Date</TableHead>
                  <TableHead className="ia-label py-2 px-4 h-9">Type</TableHead>
                  <TableHead className="ia-label py-2 px-4 h-9">Details</TableHead>
                  <TableHead className="ia-label py-2 px-4 h-9">Balance</TableHead>
                  <TableHead className="ia-label py-2 px-4 h-9 text-right">–</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {ledger.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-xs text-ia-secondary">
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
                        className={`border-b border-ia-outline-variant transition-colors ia-slide-up ia-stagger-${Math.min(idx + 1, 6)} ${
                          isLast ? "bg-ia-surface-low/40" : "hover:bg-ia-surface-low/40"
                        }`}
                      >
                        <TableCell className="py-3.5 px-4 font-mono text-xs text-ia-secondary whitespace-nowrap tabular-nums">
                          {entry.entryDate}
                        </TableCell>

                        <TableCell className="py-3.5 px-4">
                          {isPayment ? (
                            <Badge className="rounded-md ia-chip-green text-[10px] font-mono px-2 py-0.5 font-semibold">
                              Payment
                            </Badge>
                          ) : (
                            <Badge className="rounded-md ia-chip-orange text-[10px] font-mono px-2 py-0.5 font-semibold">
                              Purchase
                            </Badge>
                          )}
                        </TableCell>

                        <TableCell className="py-3.5 px-4 max-w-[240px]">
                          {isPayment ? (
                            <div className="space-y-1">
                              <p className="text-sm font-semibold font-mono text-emerald-700 tabular-nums">
                                -₱{(entry.paymentAmount ?? 0).toFixed(2)}
                              </p>
                              {entry.note ? (
                                <p className="text-xs text-ia-secondary italic leading-relaxed line-clamp-2">
                                  "{entry.note}"
                                </p>
                              ) : null}
                            </div>
                          ) : (
                            <div className="space-y-1.5">
                              <p className="text-sm font-semibold font-mono text-ia-on-surface tabular-nums">
                                +₱{(entry.totalAmount ?? 0).toFixed(2)}
                              </p>
                              {entry.items && entry.items.length > 0 ? (
                                <div className="flex flex-col gap-0.5 rounded-md border border-ia-outline-variant bg-ia-surface/60 p-2">
                                  {entry.items.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between text-[11px] gap-3">
                                      <span className="text-ia-secondary font-medium truncate">
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
                                <p className="text-xs text-ia-secondary italic leading-relaxed line-clamp-2">
                                  "{entry.note}"
                                </p>
                              ) : null}
                            </div>
                          )}
                        </TableCell>

                        <TableCell className={`py-3.5 px-4 font-mono text-xs tabular-nums ${
                          isLast ? "font-bold text-ia-on-surface" : "font-semibold text-ia-secondary"
                        }`}>
                          ₱{(entry.runningBalance ?? 0).toFixed(2)}
                        </TableCell>

                        <TableCell className="py-3.5 px-4 text-right">
                          <Button
                            id={`delete-entry-${entry.id}`}
                            variant="destructive"
                            size="xs"
                            onClick={() => void handleDeleteEntry(entry.id)}
                            className="h-7 w-7 p-0 border-0 bg-ia-error-container/20 text-ia-error hover:bg-ia-error-container/50 rounded-md transition-colors cursor-pointer"
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

          {/* Ledger summary footer */}
          {ledger.length > 0 && (
            <div className="px-4 py-3.5 border-t border-ia-outline-variant bg-ia-surface-high">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <p className="text-[11px] text-ia-secondary font-mono">
                  {ledger.length} entr{ledger.length !== 1 ? "ies" : "y"} on record
                </p>
                <div className="flex items-center gap-4">
                  <div className="text-[11px] font-mono">
                    <span className="text-ia-secondary">Debits: </span>
                    <span className="font-semibold text-ia-on-surface tabular-nums">
                      ₱{ledgerSummary.totalDebits.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono">
                    <span className="text-ia-secondary">Payments: </span>
                    <span className="font-semibold text-emerald-700 tabular-nums">
                      ₱{ledgerSummary.totalPayments.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono">
                    <span className="text-ia-secondary">Balance: </span>
                    <span className={`font-bold tabular-nums ${customer.balance > 0 ? "text-ia-error" : "text-ia-on-surface"}`}>
                      ₱{customer.balance.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
