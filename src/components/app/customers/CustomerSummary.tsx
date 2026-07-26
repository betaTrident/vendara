import { CustomerAvatar } from "@/components/app/customers/CustomerAvatar";
import { Badge } from "@/components/ui/badge";
import type { Customer } from "@/lib/types";

interface CustomerSummaryProps {
  customer: Customer;
}

export function CustomerSummary({ customer }: CustomerSummaryProps) {
  const hasBalance = customer.balance > 0;

  return (
    <section
      className="vn-card p-5"
      aria-label="Customer identity and balance"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3 min-w-0">
          <CustomerAvatar name={customer.name} className="w-11 h-11 text-xs" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-semibold text-ink font-heading truncate">
                {customer.name}
              </h2>
              {hasBalance ? (
                <Badge className="rounded-md vn-badge-rose text-[10px]">
                  Outstanding
                </Badge>
              ) : (
                <Badge className="rounded-md vn-badge-emerald text-[10px]">
                  Settled
                </Badge>
              )}
            </div>
            {customer.note ? (
              <p className="text-xs text-muted-text mt-1 line-clamp-3">
                {customer.note}
              </p>
            ) : (
              <p className="text-xs text-muted-text mt-1">
                No internal notes on file.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-md border border-hairline bg-surface-soft px-4 py-3 min-w-[180px]">
          <p className="text-[10px] uppercase tracking-wider text-muted-text font-semibold">
            Current balance
          </p>
          <p
            className={`text-2xl font-bold font-mono tabular-nums mt-1 ${
              hasBalance ? "text-destructive" : "text-ink"
            }`}
          >
            ₱{customer.balance.toFixed(2)}
          </p>
          <p className="text-[11px] text-muted-text mt-2 leading-relaxed">
            A positive balance means the customer owes the store.
          </p>
        </div>
      </div>
    </section>
  );
}
