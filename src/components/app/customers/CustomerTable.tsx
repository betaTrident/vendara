import {
  CreditCard,
  Edit2,
  ScrollText,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import { CustomerAvatar } from "@/components/app/customers/CustomerAvatar";
import { CustomerEmptyState } from "@/components/app/customers/CustomerEmptyState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Customer } from "@/lib/types";

interface CustomerTableProps {
  customers: Customer[];
  totalCount: number;
  hasFilters: boolean;
  search: string;
  page: number;
  totalPages: number;
  onEdit: (customer: Customer) => void;
  onViewLedger: (customer: Customer) => void;
  onRecordPurchase: (customer: Customer) => void;
  onRecordPayment: (customer: Customer) => void;
  onDelete: (customer: Customer) => void;
  onAdd: () => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
}

export function CustomerTable({
  customers,
  totalCount,
  hasFilters,
  search,
  page,
  totalPages,
  onEdit,
  onViewLedger,
  onRecordPurchase,
  onRecordPayment,
  onDelete,
  onAdd,
  onClearFilters,
  onPageChange,
}: CustomerTableProps) {
  return (
    <div className="vn-card overflow-hidden hidden md:block">
      <div className="overflow-x-auto">
        <Table className="vn-table" aria-label="Customers">
          <TableHeader className="vn-table-header">
            <TableRow className="hover:bg-transparent border-b border-hairline">
              <TableHead className="text-xs font-semibold py-2.5 px-4 h-10 text-muted-text">
                Customer
              </TableHead>
              <TableHead className="text-xs font-semibold py-2.5 px-4 h-10 text-muted-text">
                Balance
              </TableHead>
              <TableHead className="text-xs font-semibold py-2.5 px-4 h-10 text-muted-text">
                Note
              </TableHead>
              <TableHead className="text-xs font-semibold py-2.5 px-4 h-10 text-right text-muted-text w-[220px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="p-0">
                  <CustomerEmptyState
                    hasFilters={hasFilters}
                    search={search}
                    onAdd={onAdd}
                    onClearFilters={onClearFilters}
                  />
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => {
                const hasBalance = customer.balance > 0;

                return (
                  <TableRow key={customer.id} className="vn-table-row">
                    <TableCell className="py-3 px-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <CustomerAvatar name={customer.name} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ink truncate">
                            {customer.name}
                          </p>
                          <p className="text-[11px] text-muted-text mt-0.5">
                            {hasBalance ? "Outstanding balance" : "Settled"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      {hasBalance ? (
                        <Badge className="rounded-md vn-badge-rose text-[10px] font-mono tabular-nums">
                          ₱{customer.balance.toFixed(2)}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-text">₱0.00</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3 px-4 max-w-[220px]">
                      <p className="text-xs text-muted-text truncate">
                        {customer.note ?? "—"}
                      </p>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-9 px-2 text-xs"
                          onClick={() => onViewLedger(customer)}
                          aria-label={`View ledger for ${customer.name}`}
                        >
                          <ScrollText className="size-3.5 mr-1" aria-hidden="true" />
                          Ledger
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-9 w-9 p-0"
                          onClick={() => onRecordPurchase(customer)}
                          aria-label={`Record purchase for ${customer.name}`}
                        >
                          <ShoppingBag className="size-3.5" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-9 w-9 p-0"
                          onClick={() => onRecordPayment(customer)}
                          aria-label={`Record payment for ${customer.name}`}
                        >
                          <CreditCard className="size-3.5" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-9 w-9 p-0"
                          onClick={() => onEdit(customer)}
                          aria-label={`Edit ${customer.name}`}
                        >
                          <Edit2 className="size-3.5" aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-9 w-9 p-0 text-destructive hover:text-destructive"
                          onClick={() => onDelete(customer)}
                          aria-label={`Deactivate ${customer.name}`}
                        >
                          <Trash2 className="size-3.5" aria-hidden="true" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {customers.length > 0 ? (
        <div className="flex items-center justify-between gap-3 border-t border-hairline px-4 py-3">
          <p className="text-xs text-muted-text">
            Showing {customers.length} of {totalCount}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-9 text-xs"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Previous
            </Button>
            <span className="text-xs text-muted-text tabular-nums">
              Page {page} of {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              className="h-9 text-xs"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
