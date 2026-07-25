import { Edit2, History, Trash2 } from "lucide-react";

import { MarkupBadge } from "@/components/app/products/MarkupBadge";
import { ProductEmptyState } from "@/components/app/products/ProductEmptyState";
import { ProductMediaPlaceholder } from "@/components/app/products/ProductMediaPlaceholder";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  computeMarkupAmount,
  computeMarkupPercent,
} from "@/lib/domain/pricing";
import type { Product } from "@/lib/types";

interface ProductTableProps {
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

function formatUpdatedAt(value: string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return "—";
  }
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ProductTable({
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
}: ProductTableProps) {
  return (
    <div className="vn-card overflow-hidden hidden md:block">
      <div className="overflow-x-auto">
        <Table className="vn-table" aria-label="Products">
          <TableHeader className="vn-table-header">
            <TableRow className="hover:bg-transparent border-b border-hairline">
              <TableHead className="text-xs font-semibold py-2.5 px-4 h-10 text-muted-text">
                Product
              </TableHead>
              <TableHead className="text-xs font-semibold py-2.5 px-4 h-10 text-muted-text">
                Cost
              </TableHead>
              <TableHead className="text-xs font-semibold py-2.5 px-4 h-10 text-muted-text">
                Selling
              </TableHead>
              <TableHead className="text-xs font-semibold py-2.5 px-4 h-10 text-muted-text">
                Markup
              </TableHead>
              <TableHead className="text-xs font-semibold py-2.5 px-4 h-10 text-muted-text">
                Updated
              </TableHead>
              <TableHead className="text-xs font-semibold py-2.5 px-4 h-10 text-right text-muted-text w-[132px]">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="p-0">
                  <ProductEmptyState
                    hasFilters={hasFilters}
                    search={search}
                    onAdd={onAdd}
                    onClearFilters={onClearFilters}
                  />
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const markupAmt = computeMarkupAmount(
                  product.costPrice,
                  product.sellingPrice,
                );
                const markupPct = computeMarkupPercent(
                  product.costPrice,
                  product.sellingPrice,
                );

                return (
                  <TableRow
                    key={product.id}
                    className="vn-table-row border-b border-hairline-soft"
                  >
                    <TableCell className="py-3.5 px-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <ProductMediaPlaceholder />
                        <div className="min-w-0">
                          <div className="font-semibold text-ink text-sm leading-snug truncate">
                            {product.name}
                          </div>
                          {product.note ? (
                            <div className="text-[11px] text-muted-text italic mt-0.5 leading-relaxed line-clamp-1">
                              {product.note}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 font-mono text-xs text-muted-text tabular-nums">
                      ₱{product.costPrice.toFixed(2)}
                    </TableCell>
                    <TableCell className="py-3.5 px-4 font-mono text-sm font-semibold text-ink tabular-nums">
                      ₱{product.sellingPrice.toFixed(2)}
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] text-muted-text tabular-nums">
                          ₱{markupAmt.toFixed(2)}
                        </span>
                        <MarkupBadge percent={markupPct} />
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-xs text-muted-text">
                      {formatUpdatedAt(product.updatedAt)}
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-right">
                      <div className="inline-flex gap-1.5">
                        <Button
                          id={`edit-product-${product.id}`}
                          variant="outline"
                          size="xs"
                          onClick={() => onEdit(product)}
                          className="h-9 w-9 p-0"
                          aria-label={`Edit ${product.name}`}
                        >
                          <Edit2 className="size-3.5" aria-hidden="true" />
                        </Button>
                        <Button
                          id={`history-product-${product.id}`}
                          variant="outline"
                          size="xs"
                          onClick={() => onHistory(product)}
                          className="h-9 w-9 p-0"
                          aria-label={`Price history for ${product.name}`}
                        >
                          <History className="size-3.5" aria-hidden="true" />
                        </Button>
                        <Button
                          id={`delete-product-${product.id}`}
                          variant="destructive"
                          size="xs"
                          onClick={() => onDelete(product)}
                          className="h-9 w-9 p-0"
                          aria-label={`Deactivate ${product.name}`}
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

      {totalCount > 0 ? (
        <div className="px-4 py-3 border-t border-hairline bg-surface-soft flex items-center justify-between gap-3">
          <p className="text-[11px] text-muted-text font-mono">
            Page {page} of {totalPages} · {totalCount} item
            {totalCount !== 1 ? "s" : ""}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="h-9"
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="h-9"
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
