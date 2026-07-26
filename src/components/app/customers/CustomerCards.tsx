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
import type { Customer } from "@/lib/types";

interface CustomerCardsProps {
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

export function CustomerCards({
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
}: CustomerCardsProps) {
  if (customers.length === 0) {
    return (
      <div className="md:hidden vn-card">
        <CustomerEmptyState
          hasFilters={hasFilters}
          search={search}
          onAdd={onAdd}
          onClearFilters={onClearFilters}
        />
      </div>
    );
  }

  return (
    <div className="md:hidden space-y-3">
      <ul className="space-y-3" aria-label="Customer cards">
        {customers.map((customer) => {
          const hasBalance = customer.balance > 0;

          return (
            <li key={customer.id} className="vn-card p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <CustomerAvatar name={customer.name} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">
                      {customer.name}
                    </p>
                    {customer.note ? (
                      <p className="text-xs text-muted-text mt-1 line-clamp-2">
                        {customer.note}
                      </p>
                    ) : null}
                  </div>
                </div>
                {hasBalance ? (
                  <Badge className="rounded-md vn-badge-rose text-[10px] font-mono tabular-nums shrink-0">
                    ₱{customer.balance.toFixed(2)}
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-text shrink-0">Settled</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 text-xs"
                  onClick={() => onViewLedger(customer)}
                >
                  <ScrollText className="size-3.5 mr-1.5" aria-hidden="true" />
                  View ledger
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 text-xs"
                  onClick={() => onEdit(customer)}
                >
                  <Edit2 className="size-3.5 mr-1.5" aria-hidden="true" />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 text-xs"
                  onClick={() => onRecordPurchase(customer)}
                >
                  <ShoppingBag className="size-3.5 mr-1.5" aria-hidden="true" />
                  Purchase
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 text-xs"
                  onClick={() => onRecordPayment(customer)}
                >
                  <CreditCard className="size-3.5 mr-1.5" aria-hidden="true" />
                  Payment
                </Button>
              </div>

              <Button
                type="button"
                variant="ghost"
                className="h-11 w-full text-xs text-destructive hover:text-destructive"
                onClick={() => onDelete(customer)}
              >
                <Trash2 className="size-3.5 mr-1.5" aria-hidden="true" />
                Deactivate customer
              </Button>
            </li>
          );
        })}
      </ul>

      <div className="flex items-center justify-between gap-3 px-1">
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
            Prev
          </Button>
          <span className="text-xs text-muted-text tabular-nums">
            {page}/{totalPages}
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
    </div>
  );
}
