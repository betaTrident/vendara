import { ShieldAlert } from "lucide-react";

import type { PurchasePreview } from "@/lib/domain/transactions";
import { previewBalanceAfterPurchase } from "@/lib/domain/transactions";

interface PurchaseSummaryPanelProps {
  preview: PurchasePreview;
  currentBalance: number;
}

export function PurchaseSummaryPanel({
  preview,
  currentBalance,
}: PurchaseSummaryPanelProps) {
  const newBalance = previewBalanceAfterPurchase(
    currentBalance,
    preview.subtotal,
  );

  return (
    <aside className="space-y-4" aria-label="Purchase summary">
      <section className="vn-card p-5 space-y-3">
        <h2 className="text-sm font-semibold text-ink font-heading">
          Purchase summary
        </h2>
        <dl className="space-y-2 text-sm">
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-text">Subtotal</dt>
            <dd className="font-mono tabular-nums font-semibold">
              ₱{preview.subtotal.toFixed(2)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted-text">Total items</dt>
            <dd className="font-mono tabular-nums">{preview.itemCount}</dd>
          </div>
          <div className="flex items-center justify-between gap-3 border-t border-hairline pt-2">
            <dt className="font-semibold text-ink">Total purchase</dt>
            <dd className="font-mono tabular-nums font-bold text-ink">
              ₱{preview.subtotal.toFixed(2)}
            </dd>
          </div>
        </dl>
      </section>

      <section
        className="rounded-md border border-primary/20 bg-primary/5 p-4 space-y-2"
        aria-live="polite"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-text">
          Balance effect
        </p>
        <p className="text-sm text-muted-text">
          Current outstanding balance:{" "}
          <span className="font-mono tabular-nums font-semibold text-ink">
            ₱{currentBalance.toFixed(2)}
          </span>
        </p>
        <p className="text-sm text-muted-text">
          Purchase adds:{" "}
          <span className="font-mono tabular-nums font-semibold text-destructive">
            + ₱{preview.subtotal.toFixed(2)}
          </span>
        </p>
        <p className="text-base font-semibold text-ink">
          New outstanding balance:{" "}
          <span className="font-mono tabular-nums">₱{newBalance.toFixed(2)}</span>
        </p>
      </section>

      <div className="flex items-start gap-2 rounded-md border border-hairline bg-surface-soft p-3 text-xs text-muted-text">
        <ShieldAlert className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
        <p>
          Review product lines and the balance effect carefully before confirming.
          Totals are validated on the server using current product prices.
        </p>
      </div>
    </aside>
  );
}
