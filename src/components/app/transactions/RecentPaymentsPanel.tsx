import type { LedgerEntry } from "@/lib/types";

interface RecentPaymentsPanelProps {
  payments: LedgerEntry[];
}

export function RecentPaymentsPanel({ payments }: RecentPaymentsPanelProps) {
  return (
    <aside className="vn-card p-5 space-y-3" aria-label="Recent payments">
      <h2 className="text-sm font-semibold text-ink font-heading">
        Recent payments
      </h2>
      {payments.length === 0 ? (
        <p className="text-sm text-muted-text">
          No recent payments recorded for this customer.
        </p>
      ) : (
        <ul className="space-y-2">
          {payments.map((payment) => (
            <li
              key={payment.id}
              className="flex items-center justify-between gap-3 rounded-md border border-hairline bg-surface-soft px-3 py-2"
            >
              <div className="min-w-0">
                <p className="text-sm font-mono tabular-nums font-semibold text-emerald-700 dark:text-emerald-400">
                  ₱{(payment.paymentAmount ?? 0).toFixed(2)}
                </p>
                <p className="text-[11px] text-muted-text truncate">
                  {payment.entryDate}
                  {payment.note ? ` — ${payment.note}` : ""}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
