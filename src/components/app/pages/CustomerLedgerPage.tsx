import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, CreditCard, ShoppingBag } from "lucide-react";

import { CustomerSummary } from "@/components/app/customers/CustomerSummary";
import { BalanceChart } from "@/components/app/ledger/BalanceChart";
import { LedgerCardList } from "@/components/app/ledger/LedgerCardList";
import { LedgerFilters } from "@/components/app/ledger/LedgerFilters";
import { LedgerMetrics } from "@/components/app/ledger/LedgerMetrics";
import { LedgerSummary } from "@/components/app/ledger/LedgerSummary";
import { LedgerTable } from "@/components/app/ledger/LedgerTable";
import { PageHeader } from "@/components/app/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { buildAdminHref } from "@/lib/admin/routes";
import { fetchAdminJson } from "@/lib/client/api";
import {
  buildBalanceTrendSeries,
  filterLedgerEntries,
  summarizeLedgerView,
  type LedgerEntryTypeFilter,
} from "@/lib/domain/ledger";
import type { Customer, LedgerEntry } from "@/lib/types";

interface CustomerLedgerPageProps {
  customerId: string;
  onNavigate: (href: string) => void;
}

export function CustomerLedgerPage({
  customerId,
  onNavigate,
}: CustomerLedgerPageProps) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [entryType, setEntryType] = useState<LedgerEntryTypeFilter>("all");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showVoided, setShowVoided] = useState(false);
  const [voidingEntryId, setVoidingEntryId] = useState<string | null>(null);
  const [voidReason, setVoidReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const customersHref = buildAdminHref({ name: "customers" });

  const loadLedger = useCallback(async () => {
    const query = showVoided ? "?includeVoided=1" : "";
    return fetchAdminJson<LedgerEntry[]>(
      `/api/customers/${customerId}/ledger${query}`,
    );
  }, [customerId, showVoided]);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const [customerResult, ledgerResult] = await Promise.all([
        fetchAdminJson<Customer>(`/api/customers/${customerId}`),
        loadLedger(),
      ]);

      setCustomer(customerResult);
      setLedger(ledgerResult);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load customer ledger.",
      );
      setCustomer(null);
      setLedger([]);
    } finally {
      setLoading(false);
    }
  }, [customerId, loadLedger]);

  useEffect(() => {
    setLoading(true);
    void refresh();
  }, [refresh]);

  const filteredLedger = useMemo(
    () =>
      filterLedgerEntries(ledger, {
        entryType,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
      }),
    [ledger, entryType, fromDate, toDate],
  );

  const metrics = useMemo(() => summarizeLedgerView(ledger), [ledger]);

  const trendPoints = useMemo(
    () => buildBalanceTrendSeries(ledger),
    [ledger],
  );

  const chartSummary = useMemo(() => {
    if (trendPoints.length === 0) {
      return "No balance trend data available.";
    }

    const first = trendPoints[0];
    const last = trendPoints[trendPoints.length - 1];
    return `Balance trend over ${trendPoints.length} points. Balance moved from ₱${first.balance.toFixed(2)} to ₱${last.balance.toFixed(2)}.`;
  }, [trendPoints]);

  const handleVoidEntry = async (entryId: string) => {
    const reason = voidReason.trim();
    if (reason.length < 3) {
      setSubmitError("Enter a short correction reason before voiding.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await fetchAdminJson(`/api/ledger/${entryId}/void`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      });
      setVoidingEntryId(null);
      setVoidReason("");
      await refresh();
    } catch (voidError) {
      setSubmitError(
        voidError instanceof Error ? voidError.message : "Unable to void entry.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const navigateToPurchase = () => {
    onNavigate(
      buildAdminHref({
        name: "record-purchase",
        customerId,
      }),
    );
  };

  const navigateToPayment = () => {
    onNavigate(
      buildAdminHref({
        name: "record-payment",
        customerId,
      }),
    );
  };

  if (loading && !customer) {
    return (
      <div className="space-y-6" aria-busy="true">
        <div className="vn-skeleton h-8 w-48" />
        <div className="vn-skeleton h-28 w-full rounded-md" />
        <div className="vn-skeleton h-48 w-full rounded-md" />
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-4">
        <Button
          type="button"
          variant="ghost"
          className="h-11 px-2"
          onClick={() => onNavigate(customersHref)}
        >
          <ArrowLeft className="size-4 mr-1.5" aria-hidden="true" />
          Back to Customers
        </Button>
        <div role="alert" className="vn-card p-6 space-y-2">
          <h1 className="text-lg font-semibold text-ink font-heading">
            Customer not found
          </h1>
          <p className="text-sm text-muted-text">
            {error ??
              "This customer is missing or inactive. Return to the directory and try another account."}
          </p>
        </div>
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
          title="Customer ledger"
          description="Review transactions, running balances, and corrections for this account."
          actions={
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                className="h-11 text-xs font-semibold"
                onClick={navigateToPurchase}
              >
                <ShoppingBag className="size-3.5 mr-1.5" aria-hidden="true" />
                Record Purchase
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 text-xs font-semibold"
                onClick={navigateToPayment}
              >
                <CreditCard className="size-3.5 mr-1.5" aria-hidden="true" />
                Record Payment
              </Button>
            </div>
          }
        />
      </div>

      <CustomerSummary customer={customer} />

      <LedgerMetrics summary={metrics} />

      <LedgerFilters
        entryType={entryType}
        fromDate={fromDate}
        toDate={toDate}
        showVoided={showVoided}
        onEntryTypeChange={setEntryType}
        onFromDateChange={setFromDate}
        onToDateChange={setToDate}
        onShowVoidedChange={setShowVoided}
      />

      {submitError ? (
        <p className="text-sm text-destructive" role="alert">
          {submitError}
        </p>
      ) : null}

      <BalanceChart points={trendPoints} summaryText={chartSummary} />

      <LedgerTable
        entries={filteredLedger}
        voidingEntryId={voidingEntryId}
        voidReason={voidReason}
        isSubmitting={isSubmitting}
        onVoidReasonChange={setVoidReason}
        onStartVoid={(entryId) => {
          setVoidingEntryId(entryId);
          setVoidReason("");
        }}
        onCancelVoid={() => {
          setVoidingEntryId(null);
          setVoidReason("");
        }}
        onConfirmVoid={(entryId) => {
          void handleVoidEntry(entryId);
        }}
      />

      <LedgerCardList
        entries={filteredLedger}
        voidingEntryId={voidingEntryId}
        voidReason={voidReason}
        isSubmitting={isSubmitting}
        onVoidReasonChange={setVoidReason}
        onStartVoid={(entryId) => {
          setVoidingEntryId(entryId);
          setVoidReason("");
        }}
        onCancelVoid={() => {
          setVoidingEntryId(null);
          setVoidReason("");
        }}
        onConfirmVoid={(entryId) => {
          void handleVoidEntry(entryId);
        }}
      />

      <LedgerSummary
        summary={metrics}
        customerBalance={customer.balance}
        visibleCount={filteredLedger.length}
      />

    </div>
  );
}
