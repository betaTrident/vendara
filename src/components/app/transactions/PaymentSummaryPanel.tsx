import type { PaymentBalancePreview } from "@/lib/domain/transactions";

interface PaymentSummaryPanelProps {
  preview: PaymentBalancePreview;
}

export function PaymentSummaryPanel({ preview }: PaymentSummaryPanelProps) {
  return (
    <section
      className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3"
      aria-label="Payment summary"
      aria-live="polite"
    >
      <h2 className="text-sm font-semibold text-ink font-heading">
        Payment summary
      </h2>
      <dl className="space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-text">Previous balance</dt>
          <dd className="font-mono tabular-nums font-semibold">
            ₱{preview.previousBalance.toFixed(2)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-text">Payment amount</dt>
          <dd className="font-mono tabular-nums font-semibold text-emerald-700 dark:text-emerald-400">
            − ₱{preview.paymentAmount.toFixed(2)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-hairline/70 pt-2">
          <dt className="font-semibold text-ink">New balance after payment</dt>
          <dd className="font-mono tabular-nums font-bold text-ink">
            ₱{Math.max(0, preview.resultingBalance).toFixed(2)}
          </dd>
        </div>
      </dl>
      {preview.isOverpayment ? (
        <p className="text-xs text-destructive" role="alert">
          Payment exceeds the outstanding balance. Reduce the amount before
          recording.
        </p>
      ) : null}
      <p className="text-[11px] text-muted-text">
        Payment method tracking is not available in this release. Use the notes
        field for any reference you need to keep.
      </p>
    </section>
  );
}
