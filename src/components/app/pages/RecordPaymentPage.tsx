import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Lock } from "lucide-react";

import { PageHeader } from "@/components/app/layout/PageHeader";
import { CustomerPicker } from "@/components/app/transactions/CustomerPicker";
import { PaymentSummaryPanel } from "@/components/app/transactions/PaymentSummaryPanel";
import { RecentPaymentsPanel } from "@/components/app/transactions/RecentPaymentsPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { buildAdminHref } from "@/lib/admin/routes";
import { createIdempotencyKey, fetchAdminJson } from "@/lib/client/api";
import {
  canSubmitPayment,
  getRecentPayments,
  previewPaymentBalance,
} from "@/lib/domain/transactions";
import type { Customer, LedgerEntry } from "@/lib/types";

interface RecordPaymentPageProps {
  initialCustomerId?: string;
  isOnline: boolean;
  onNavigate: (href: string) => void;
  onStatsChange?: () => void;
}

export function RecordPaymentPage({
  initialCustomerId,
  isOnline,
  onNavigate,
  onStatsChange,
}: RecordPaymentPageProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    initialCustomerId ?? "",
  );
  const [paymentAmount, setPaymentAmount] = useState("");
  const [entryDate, setEntryDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    createIdempotencyKey(),
  );

  const customersHref = buildAdminHref({ name: "customers" });

  const loadCustomers = useCallback(async () => {
    setLoadError(null);
    try {
      const customerResult = await fetchAdminJson<Customer[]>("/api/customers");
      setCustomers(customerResult);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Unable to load payment form data.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLedger = useCallback(async (customerId: string) => {
    if (!customerId) {
      setLedger([]);
      return;
    }

    try {
      const ledgerResult = await fetchAdminJson<LedgerEntry[]>(
        `/api/customers/${customerId}/ledger`,
      );
      setLedger(ledgerResult);
    } catch {
      setLedger([]);
    }
  }, []);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  useEffect(() => {
    if (initialCustomerId) {
      setSelectedCustomerId(initialCustomerId);
    }
  }, [initialCustomerId]);

  useEffect(() => {
    void loadLedger(selectedCustomerId);
  }, [loadLedger, selectedCustomerId]);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId],
  );

  const paymentPreview = useMemo(
    () => previewPaymentBalance(selectedCustomer?.balance ?? 0, paymentAmount),
    [paymentAmount, selectedCustomer?.balance],
  );

  const recentPayments = useMemo(
    () => getRecentPayments(ledger),
    [ledger],
  );

  const canSubmit =
    Boolean(selectedCustomer) &&
    canSubmitPayment(paymentPreview, isOnline) &&
    !isSubmitting;

  const handleSubmit = async () => {
    if (!selectedCustomer || !canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await fetchAdminJson(
        `/api/customers/${selectedCustomer.id}/ledger/payment`,
        {
          method: "POST",
          idempotencyKey,
          body: JSON.stringify({
            entryDate,
            paymentAmount: paymentPreview.paymentAmount,
            note: note.trim() || null,
          }),
        },
      );

      setIdempotencyKey(createIdempotencyKey());
      setPaymentAmount("");
      setNote("");
      onStatsChange?.();
      onNavigate(
        buildAdminHref({
          name: "customer-ledger",
          customerId: selectedCustomer.id,
        }),
      );
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Unable to record payment.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6" aria-busy="true">
        <div className="vn-skeleton h-8 w-56" />
        <div className="vn-skeleton h-40 w-full rounded-md" />
        <div className="vn-skeleton h-48 w-full rounded-md" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button
          type="button"
          variant="ghost"
          className="h-11 px-2 mb-2"
          onClick={() => onNavigate(customersHref)}
        >
          <ArrowLeft className="size-4 mr-1.5" aria-hidden="true" />
          Back to Customers
        </Button>
        <PageHeader
          title="Record payment"
          description="Record a payment and update your customer's outstanding balance."
        />
      </div>

      {loadError ? (
        <div role="alert" className="vn-card p-4 text-sm text-destructive">
          {loadError}
        </div>
      ) : null}

      {!isOnline ? (
        <p className="text-sm text-muted-text" role="status">
          You are offline. Payments cannot be recorded until you reconnect.
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <CustomerPicker
            customers={customers}
            selectedCustomerId={selectedCustomerId}
            onSelect={setSelectedCustomerId}
          />

          <section className="vn-card p-5 space-y-4" aria-label="Payment details">
            <h2 className="text-sm font-semibold text-ink font-heading">
              Payment details
            </h2>

            <div className="space-y-1.5">
              <Label htmlFor="payment-amount" className="text-xs font-semibold text-ink">
                Payment amount
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-text text-xs font-mono">
                  ₱
                </span>
                <Input
                  id="payment-amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={paymentAmount}
                  onChange={(event) => setPaymentAmount(event.target.value)}
                  className="h-11 pl-7 font-mono"
                  required
                />
              </div>
              {selectedCustomer ? (
                <p className="text-xs text-muted-text">
                  Current outstanding balance:{" "}
                  <span className="font-mono tabular-nums font-semibold text-ink">
                    ₱{selectedCustomer.balance.toFixed(2)}
                  </span>
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="payment-entry-date"
                className="text-xs font-semibold text-ink"
              >
                Payment date
              </Label>
              <Input
                id="payment-entry-date"
                type="date"
                value={entryDate}
                onChange={(event) => setEntryDate(event.target.value)}
                className="h-11 w-full sm:w-48 font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="payment-note" className="text-xs font-semibold text-ink">
                Reference or notes (optional)
              </Label>
              <Textarea
                id="payment-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                maxLength={255}
                className="min-h-[88px] resize-none text-xs"
              />
            </div>
          </section>

          {selectedCustomer ? (
            <PaymentSummaryPanel preview={paymentPreview} />
          ) : null}

          {submitError ? (
            <p className="text-sm text-destructive" role="alert">
              {submitError}
            </p>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              id="post-payment-btn"
              type="button"
              className="h-11 flex-1 text-xs font-semibold"
              disabled={!canSubmit}
              onClick={() => void handleSubmit()}
            >
              <Lock className="size-3.5 mr-1.5" aria-hidden="true" />
              {isSubmitting ? "Recording..." : "Record payment"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-11 text-xs"
              onClick={() => onNavigate(customersHref)}
            >
              Cancel
            </Button>
          </div>
        </div>

        {selectedCustomer ? (
          <RecentPaymentsPanel payments={recentPayments} />
        ) : null}
      </div>
    </div>
  );
}
