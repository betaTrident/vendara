import { Edit2, History, Trash2 } from "lucide-react";

import { MarkupBadge } from "@/components/app/products/MarkupBadge";
import { ProductEmptyState } from "@/components/app/products/ProductEmptyState";
import { ProductMediaPlaceholder } from "@/components/app/products/ProductMediaPlaceholder";
import { Button } from "@/components/ui/button";
import {
  computeMarkupAmount,
  computeMarkupPercent,
} from "@/lib/domain/pricing";
import type { Product } from "@/lib/types";

interface ProductCardsProps {
  products: Product[];
  totalCount: number;
  hasFilters: boolean;
  search: string;
  page: number;
  totalPages: number;
  onEdit: (product: Product) => void;
  onHistory: (product: Product) => void;
  onDelete: (product: Product) => void;
  onAdd: () => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
}

export function ProductCards({
  products,
  totalCount,
  hasFilters,
  search,
  page,
  totalPages,
  onEdit,
  onHistory,
  onDelete,
  onAdd,
  onClearFilters,
  onPageChange,
}: ProductCardsProps) {
  if (products.length === 0) {
    return (
      <div className="vn-card md:hidden">
        <ProductEmptyState
          hasFilters={hasFilters}
          search={search}
          onAdd={onAdd}
          onClearFilters={onClearFilters}
        />
      </div>
    );
  }

  return (
    <div className="space-y-3 md:hidden">
      <ul className="space-y-3" aria-label="Products">
        {products.map((product) => {
          const markupAmt = computeMarkupAmount(
            product.costPrice,
            product.sellingPrice,
          );
          const markupPct = computeMarkupPercent(
            product.costPrice,
            product.sellingPrice,
          );

          return (
            <li key={product.id} className="vn-card p-4 space-y-3">
              <div className="flex items-start gap-3">
                <ProductMediaPlaceholder />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink text-sm leading-snug">
                    {product.name}
                  </p>
                  {product.note ? (
                    <p className="text-[11px] text-muted-text mt-0.5 line-clamp-2">
                      {product.note}
                    </p>
                  ) : null}
                </div>
                <MarkupBadge percent={markupPct} />
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-muted-text font-semibold uppercase tracking-wider text-[10px]">
                    Cost
                  </p>
                  <p className="font-mono tabular-nums text-ink mt-0.5">
                    ₱{product.costPrice.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-text font-semibold uppercase tracking-wider text-[10px]">
                    Selling
                  </p>
                  <p className="font-mono tabular-nums font-semibold text-ink mt-0.5">
                    ₱{product.sellingPrice.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-text font-semibold uppercase tracking-wider text-[10px]">
                    Profit
                  </p>
                  <p className="font-mono tabular-nums text-ink mt-0.5">
                    ₱{markupAmt.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onEdit(product)}
                  className="h-11 flex-1 text-xs font-semibold"
                  aria-label={`Edit ${product.name}`}
                >
                  <Edit2 className="size-3.5 mr-1.5" aria-hidden="true" />
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onHistory(product)}
                  className="h-11 flex-1 text-xs font-semibold"
                  aria-label={`Price history for ${product.name}`}
                >
                  <History className="size-3.5 mr-1.5" aria-hidden="true" />
                  History
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => onDelete(product)}
                  className="h-11 w-11 p-0"
                  aria-label={`Deactivate ${product.name}`}
                >
                  <Trash2 className="size-3.5" aria-hidden="true" />
                </Button>
              </div>
            </li>
          );
        })}
      </ul>

      {totalCount > 0 ? (
        <div className="flex items-center justify-between gap-3 px-1">
          <p className="text-[11px] text-muted-text font-mono">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="h-11"
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="h-11"
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
