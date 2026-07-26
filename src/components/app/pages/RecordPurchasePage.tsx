import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, Lock } from "lucide-react";

import { PageHeader } from "@/components/app/layout/PageHeader";
import { CustomerPicker } from "@/components/app/transactions/CustomerPicker";
import {
  emptyPurchaseLine,
  ProductLineEditor,
} from "@/components/app/transactions/ProductLineEditor";
import { PurchaseSummaryPanel } from "@/components/app/transactions/PurchaseSummaryPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { buildAdminHref } from "@/lib/admin/routes";
import { createIdempotencyKey, fetchAdminJson } from "@/lib/client/api";
import {
  canSubmitPurchase,
  previewPurchase,
  type PurchaseLineDraft,
} from "@/lib/domain/transactions";
import type { Customer, Product } from "@/lib/types";

interface RecordPurchasePageProps {
  initialCustomerId?: string;
  isOnline: boolean;
  onNavigate: (href: string) => void;
  onStatsChange?: () => void;
}

export function RecordPurchasePage({
  initialCustomerId,
  isOnline,
  onNavigate,
  onStatsChange,
}: RecordPurchasePageProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(
    initialCustomerId ?? "",
  );
  const [rows, setRows] = useState<PurchaseLineDraft[]>([emptyPurchaseLine()]);
  const [productSearch, setProductSearch] = useState("");
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

  const loadData = useCallback(async () => {
    setLoadError(null);
    try {
      const [customerResult, productResult] = await Promise.all([
        fetchAdminJson<Customer[]>("/api/customers"),
        fetchAdminJson<Product[]>("/api/products"),
      ]);
      setCustomers(customerResult);
      setProducts(productResult);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : "Unable to load purchase form data.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (initialCustomerId) {
      setSelectedCustomerId(initialCustomerId);
    }
  }, [initialCustomerId]);

  const selectedCustomer = useMemo(
    () => customers.find((customer) => customer.id === selectedCustomerId) ?? null,
    [customers, selectedCustomerId],
  );

  const preview = useMemo(() => previewPurchase(rows, products), [rows, products]);
  const canSubmit =
    isOnline &&
    !isSubmitting &&
    Boolean(selectedCustomer) &&
    canSubmitPurchase(preview);

  const handleSubmit = async () => {
    if (!selectedCustomer || !canSubmit) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await fetchAdminJson(`/api/customers/${selectedCustomer.id}/ledger/debt`, {
        method: "POST",
        idempotencyKey,
        body: JSON.stringify({
          entryDate,
          note: note.trim() || null,
          items: preview.lines.map((line) => ({
            productId: line.productId,
            quantity: line.quantity,
          })),
        }),
      });

      setIdempotencyKey(createIdempotencyKey());
      setRows([emptyPurchaseLine()]);
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
        error instanceof Error
          ? error.message
          : "Unable to record credit purchase.",
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
        <div className="vn-skeleton h-64 w-full rounded-md" />
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
          title="Record credit purchase"
          description="Purchases made on credit are added to the customer's outstanding balance."
        />
      </div>

      {loadError ? (
        <div role="alert" className="vn-card p-4 text-sm text-destructive">
          {loadError}
        </div>
      ) : null}

      {!isOnline ? (
        <p className="text-sm text-muted-text" role="status">
          You are offline. Credit purchases cannot be recorded until you
          reconnect.
        </p>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <CustomerPicker
            customers={customers}
            selectedCustomerId={selectedCustomerId}
            onSelect={setSelectedCustomerId}
          />

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-md border border-hairline bg-surface-soft p-3">
            <Label
              htmlFor="purchase-entry-date"
              className="text-xs font-bold text-muted-text uppercase tracking-wider"
            >
              Posting date
            </Label>
            <Input
              id="purchase-entry-date"
              type="date"
              value={entryDate}
              onChange={(event) => setEntryDate(event.target.value)}
              className="h-11 w-full sm:w-48 font-mono text-xs"
            />
          </div>

          <ProductLineEditor
            rows={rows}
            products={products}
            productSearch={productSearch}
            onProductSearchChange={setProductSearch}
            onRowsChange={setRows}
          />

          <div className="space-y-1.5">
            <Label htmlFor="purchase-note" className="text-xs font-semibold text-ink">
              Notes (optional)
            </Label>
            <Textarea
              id="purchase-note"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={255}
              className="min-h-[88px] resize-none text-xs"
            />
          </div>

          {submitError ? (
            <p className="text-sm text-destructive" role="alert">
              {submitError}
            </p>
          ) : null}

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              id="post-debt-btn"
              type="button"
              className="h-11 flex-1 text-xs font-semibold"
              disabled={!canSubmit}
              onClick={() => void handleSubmit()}
            >
              <Lock className="size-3.5 mr-1.5" aria-hidden="true" />
              {isSubmitting ? "Recording..." : "Record credit purchase"}
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
          <PurchaseSummaryPanel
            preview={preview}
            currentBalance={selectedCustomer.balance}
          />
        ) : null}
      </div>
    </div>
  );
}
