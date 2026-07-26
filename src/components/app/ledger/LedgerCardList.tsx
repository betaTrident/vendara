import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { LedgerEntry } from "@/lib/types";

interface LedgerCardListProps {
  entries: LedgerEntry[];
  voidingEntryId: string | null;
  voidReason: string;
  isSubmitting: boolean;
  onVoidReasonChange: (value: string) => void;
  onStartVoid: (entryId: string) => void;
  onCancelVoid: () => void;
  onConfirmVoid: (entryId: string) => void;
}

export function LedgerCardList({
  entries,
  voidingEntryId,
  voidReason,
  isSubmitting,
  onVoidReasonChange,
  onStartVoid,
  onCancelVoid,
  onConfirmVoid,
}: LedgerCardListProps) {
  if (entries.length === 0) {
    return (
      <section className="md:hidden vn-card p-6 text-center text-xs text-muted-text">
        No transactions match the current filters.
      </section>
    );
  }

  return (
    <section className="md:hidden space-y-3" aria-label="Ledger timeline">
      <ul className="space-y-3">
        {entries.map((entry) => {
          const isPayment = entry.entryType === "payment";
          const isVoided = Boolean(entry.voidedAt);

          return (
            <li key={entry.id} className="vn-card p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-mono text-muted-text">
                    {entry.entryDate}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    {isPayment ? (
                      <Badge className="rounded-md vn-badge-emerald text-[10px]">
                        Payment
                      </Badge>
                    ) : (
                      <Badge className="rounded-md vn-badge-rose text-[10px]">
                        Purchase
                      </Badge>
                    )}
                    {isVoided ? (
                      <Badge className="rounded-md bg-muted text-[10px]">
                        Voided
                      </Badge>
                    ) : null}
                  </div>
                </div>
                <p className="font-mono text-sm font-semibold tabular-nums text-ink">
                  {isVoided
                    ? "—"
                    : `₱${(entry.runningBalance ?? 0).toFixed(2)}`}
                </p>
              </div>

              {isPayment ? (
                <p className="text-sm font-bold font-mono text-emerald-700 tabular-nums">
                  -₱{(entry.paymentAmount ?? 0).toFixed(2)}
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-bold font-mono text-ink tabular-nums">
                    +₱{(entry.totalAmount ?? 0).toFixed(2)}
                  </p>
                  {entry.items?.length ? (
                    <ul className="text-[11px] text-muted-text space-y-1">
                      {entry.items.map((item) => (
                        <li key={item.id}>
                          {item.productNameSnapshot} — ₱
                          {item.unitSellingPriceSnapshot.toFixed(2)} × {item.quantity}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              )}

              {entry.note ? (
                <p className="text-xs text-muted-text">{entry.note}</p>
              ) : null}

              {!isVoided ? (
                voidingEntryId === entry.id ? (
                  <div className="space-y-2">
                    <Input
                      value={voidReason}
                      onChange={(event) =>
                        onVoidReasonChange(event.target.value)
                      }
                      placeholder="Correction reason"
                      className="h-10 text-xs"
                      aria-label="Void reason"
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="h-10 flex-1 text-xs"
                        onClick={onCancelVoid}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        className="h-10 flex-1 text-xs"
                        disabled={isSubmitting}
                        onClick={() => onConfirmVoid(entry.id)}
                      >
                        Confirm void
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="h-10 w-full text-xs"
                    disabled={isSubmitting}
                    onClick={() => onStartVoid(entry.id)}
                  >
                    Void entry
                  </Button>
                )
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
