import { Minus, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  filterProductsForPicker,
  type PurchaseLineDraft,
  previewPurchase,
} from "@/lib/domain/transactions";
import type { Product } from "@/lib/types";

export const emptyPurchaseLine = (): PurchaseLineDraft => ({
  productId: "",
  quantity: "1",
});

interface ProductLineEditorProps {
  rows: PurchaseLineDraft[];
  products: Product[];
  productSearch: string;
  onProductSearchChange: (value: string) => void;
  onRowsChange: (rows: PurchaseLineDraft[]) => void;
}

export function ProductLineEditor({
  rows,
  products,
  productSearch,
  onProductSearchChange,
  onRowsChange,
}: ProductLineEditorProps) {
  const filteredProducts = filterProductsForPicker(products, productSearch);
  const preview = previewPurchase(rows, products);

  const updateRow = (index: number, patch: Partial<PurchaseLineDraft>) => {
    onRowsChange(
      rows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    );
  };

  const removeRow = (indexToRemove: number) => {
    if (rows.length <= 1) {
      onRowsChange([emptyPurchaseLine()]);
      return;
    }

    onRowsChange(rows.filter((_, index) => index !== indexToRemove));
  };

  const adjustQuantity = (index: number, delta: number) => {
    const current = Number(rows[index]?.quantity) || 1;
    const next = Math.max(1, current + delta);
    updateRow(index, { quantity: String(next) });
  };

  return (
    <section className="space-y-4" aria-label="Product lines">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1.5 flex-1">
          <Label htmlFor="product-search" className="text-xs font-semibold text-ink">
            Search products
          </Label>
          <Input
            id="product-search"
            value={productSearch}
            onChange={(event) => onProductSearchChange(event.target.value)}
            placeholder="Search by product name"
            className="h-11"
          />
        </div>
        <p className="text-xs text-muted-text">
          {filteredProducts.length} product
          {filteredProducts.length === 1 ? "" : "s"} available
        </p>
      </div>

      <div className="space-y-3">
        {rows.map((row, index) => {
          const line = preview.lines.find(
            (entry) => entry.productId === row.productId,
          );

          return (
            <article
              key={index}
              className="rounded-md border border-hairline bg-card p-4 space-y-3"
              aria-label={`Product line ${index + 1}`}
            >
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_120px_120px]">
                <div className="space-y-1.5">
                  <Label
                    htmlFor={`purchase-product-${index}`}
                    className="text-xs font-semibold text-ink"
                  >
                    Product
                  </Label>
                  <select
                    id={`purchase-product-${index}`}
                    className="h-11 w-full rounded-md border border-hairline bg-card px-3 text-sm"
                    value={row.productId}
                    onChange={(event) =>
                      updateRow(index, { productId: event.target.value })
                    }
                  >
                    <option value="">Select product...</option>
                    {filteredProducts.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} — ₱{product.sellingPrice.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor={`purchase-qty-${index}`}
                    className="text-xs font-semibold text-ink"
                  >
                    Quantity
                  </Label>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 w-11 shrink-0"
                      onClick={() => adjustQuantity(index, -1)}
                      aria-label={`Decrease quantity for row ${index + 1}`}
                    >
                      <Minus className="size-4" aria-hidden="true" />
                    </Button>
                    <Input
                      id={`purchase-qty-${index}`}
                      type="number"
                      min="1"
                      step="1"
                      inputMode="numeric"
                      value={row.quantity}
                      onChange={(event) =>
                        updateRow(index, { quantity: event.target.value })
                      }
                      className="h-11 text-center font-mono"
                      aria-label={`Quantity for row ${index + 1}`}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 w-11 shrink-0"
                      onClick={() => adjustQuantity(index, 1)}
                      aria-label={`Increase quantity for row ${index + 1}`}
                    >
                      <Plus className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-ink">Line total</p>
                  <div className="flex h-11 items-center justify-between rounded-md border border-hairline bg-surface-soft px-3">
                    <span className="text-sm font-mono tabular-nums font-semibold">
                      ₱{(line?.lineTotal ?? 0).toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-hairline"
                      aria-label={`Remove row ${index + 1}`}
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>

              {line ? (
                <p className="text-[11px] text-muted-text">
                  Selling price ₱{line.unitPrice.toFixed(2)} each. Line discounts
                  are not available in this release.
                </p>
              ) : (
                <p className="text-[11px] text-muted-text">
                  Choose a product and quantity to preview the line total.
                </p>
              )}
            </article>
          );
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-11 w-full text-xs"
        onClick={() => onRowsChange([...rows, emptyPurchaseLine()])}
      >
        <Plus className="size-3.5 mr-1.5" aria-hidden="true" />
        Add another product
      </Button>
    </section>
  );
}
