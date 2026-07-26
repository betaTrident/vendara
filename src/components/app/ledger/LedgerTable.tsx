import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LedgerEntry } from "@/lib/types";

interface LedgerTableProps {
  entries: LedgerEntry[];
  voidingEntryId: string | null;
  voidReason: string;
  isSubmitting: boolean;
  onVoidReasonChange: (value: string) => void;
  onStartVoid: (entryId: string) => void;
  onCancelVoid: () => void;
  onConfirmVoid: (entryId: string) => void;
}

export function LedgerTable({
  entries,
  voidingEntryId,
  voidReason,
  isSubmitting,
  onVoidReasonChange,
  onStartVoid,
  onCancelVoid,
  onConfirmVoid,
}: LedgerTableProps) {
  return (
    <section className="vn-card overflow-hidden hidden md:block">
      <div className="px-5 py-4 border-b border-hairline">
        <h3 className="text-sm font-semibold text-ink font-heading">
          Ledger history
        </h3>
        <p className="text-xs text-muted-text mt-1">
          Newest first. Voided entries stay auditable but do not affect balance.
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table className="vn-table" aria-label="Customer ledger history">
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>Balance</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-xs text-muted-text">
                  No transactions match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              entries.map((entry, index) => {
                const isPayment = entry.entryType === "payment";
                const isVoided = Boolean(entry.voidedAt);
                const isLatest = index === 0 && !isVoided;

                return (
                  <TableRow
                    key={entry.id}
                    className={isVoided ? "opacity-70" : undefined}
                  >
                    <TableCell className="font-mono text-xs text-muted-text tabular-nums">
                      {entry.entryDate}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
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
                    </TableCell>
                    <TableCell className="max-w-[280px]">
                      {isPayment ? (
                        <div className="space-y-1">
                          <p className="text-sm font-bold font-mono text-emerald-700 tabular-nums">
                            -₱{(entry.paymentAmount ?? 0).toFixed(2)}
                          </p>
                          {entry.note ? (
                            <p className="text-xs text-muted-text">{entry.note}</p>
                          ) : null}
                        </div>
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
                                  {item.unitSellingPriceSnapshot.toFixed(2)} ×{" "}
                                  {item.quantity}
                                </li>
                              ))}
                            </ul>
                          ) : null}
                          {entry.note ? (
                            <p className="text-xs text-muted-text">{entry.note}</p>
                          ) : null}
                        </div>
                      )}
                    </TableCell>
                    <TableCell
                      className={`font-mono text-xs tabular-nums ${
                        isLatest ? "font-bold text-ink" : "text-muted-text"
                      }`}
                    >
                      {isVoided ? "—" : `₱${(entry.runningBalance ?? 0).toFixed(2)}`}
                    </TableCell>
                    <TableCell className="text-right align-top">
                      {!isVoided ? (
                        voidingEntryId === entry.id ? (
                          <div className="space-y-2 max-w-xs ml-auto">
                            <Input
                              value={voidReason}
                              onChange={(event) =>
                                onVoidReasonChange(event.target.value)
                              }
                              placeholder="Correction reason"
                              className="h-9 text-xs"
                              aria-label="Void reason"
                            />
                            <div className="flex gap-2 justify-end">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-8 text-xs"
                                onClick={onCancelVoid}
                              >
                                Cancel
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                className="h-8 text-xs"
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
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs"
                            disabled={isSubmitting}
                            onClick={() => onStartVoid(entry.id)}
                          >
                            Void
                          </Button>
                        )
                      ) : (
                        <span className="text-[10px] text-muted-text">
                          No balance impact
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
