import { useEffect, useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  History,
  TrendingUp,
  TrendingDown,
  Info,
  Tag,
  Search,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { fetchAdminJson, fetchJson } from "@/lib/client/api";
import type { PriceHistoryItem, Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

const emptyProductForm = {
  id: "",
  name: "",
  costPrice: "",
  sellingPrice: "",
  note: "",
};

interface ProductManagerProps {
  onStatsChange?: (productCount: number) => void;
}

// ── Markup badge ──────────────────────────────────────────────────────────────
const MarkupBadge = ({ pct }: { pct: number }) => {
  const cls =
    pct < 15
      ? "ia-markup-low"
      : pct >= 40
      ? "ia-markup-high"
      : "ia-markup-good";

  return (
    <Badge className={`rounded-[4px] text-[10px] font-mono font-semibold px-2 py-0.5 border ${cls}`}>
      {pct >= 0 ? "+" : ""}{pct.toFixed(0)}%
    </Badge>
  );
};

export const ProductManager = ({ onStatsChange }: ProductManagerProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [historyByProductId, setHistoryByProductId] = useState<
    Record<string, PriceHistoryItem[]>
  >({});
  const [form, setForm] = useState(emptyProductForm);
  const [isSaving, setIsSaving] = useState(false);
  const [activeHistoryProductId, setActiveHistoryProductId] = useState<string | null>(null);
  const [tableSearch, setTableSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  const loadProducts = async () => {
    const data = await fetchJson<Product[]>("/api/products");
    setProducts(data);
    onStatsChange?.(data.length);
  };

  useEffect(() => {
    void loadProducts();
  }, []);

  // When editing, always show the form
  useEffect(() => {
    if (form.id) setShowAddForm(true);
  }, [form.id]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);

    try {
      const payload = {
        name: form.name,
        costPrice: Number(form.costPrice),
        sellingPrice: Number(form.sellingPrice),
        note: form.note || null,
      };

      if (form.id) {
        await fetchAdminJson(`/api/products/${form.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      } else {
        await fetchAdminJson("/api/products", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      }

      setForm(emptyProductForm);
      setShowAddForm(false);
      await loadProducts();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    await fetchAdminJson(`/api/products/${productId}`, { method: "DELETE" });
    if (activeHistoryProductId === productId) {
      setActiveHistoryProductId(null);
    }
    await loadProducts();
  };

  const handleViewHistory = async (productId: string) => {
    if (activeHistoryProductId === productId) {
      setActiveHistoryProductId(null);
      return;
    }

    const history = await fetchAdminJson<PriceHistoryItem[]>(
      `/api/products/${productId}/history`,
    );
    setHistoryByProductId((current) => ({
      ...current,
      [productId]: history,
    }));
    setActiveHistoryProductId(productId);
  };

  const markupAmount =
    form.costPrice && form.sellingPrice
      ? Number(form.sellingPrice) - Number(form.costPrice)
      : null;
  const markupPercent =
    markupAmount !== null && Number(form.costPrice) > 0
      ? (markupAmount / Number(form.costPrice)) * 100
      : null;

  // Filtered products (table-level search)
  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(tableSearch.toLowerCase()),
  );

  return (
    <div className="space-y-4">

      {/* ── Toolbar ── */}
      <div className="ia-toolbar">
        <div className="ia-toolbar__left">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ia-secondary/50 pointer-events-none" aria-hidden="true" />
            <Input
              id="product-table-search"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Filter products..."
              className="h-9 pl-8 pr-8 rounded-lg border border-ia-outline-variant bg-ia-surface-card text-sm placeholder:text-ia-secondary/40 focus-visible:ring-2 focus-visible:ring-ia-primary-container/20 focus-visible:border-ia-primary-container transition-all ia-focus-ring"
              aria-label="Filter products"
            />
            {tableSearch && (
              <button
                onClick={() => setTableSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ia-secondary/40 hover:text-ia-secondary transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>
        <div className="ia-toolbar__right">
          <Button
            id="add-product-btn"
            type="button"
            onClick={() => {
              setForm(emptyProductForm);
              setShowAddForm((prev) => !prev);
            }}
            className="h-9 px-4 rounded-lg bg-gradient-to-r from-ia-primary-container to-[#b02f00] text-ia-on-primary font-bold text-xs shadow-sm hover:shadow-md hover:brightness-105 active:scale-95 transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ia-primary-container/30"
          >
            <Plus className="size-3.5 mr-1.5" aria-hidden="true" />
            {showAddForm && !form.id ? "Cancel" : "Add product"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] items-start">

        {/* ── Left Column: Form + History ── */}
        <div className="space-y-4">

          {/* Product Form */}
          {(showAddForm || form.id) && (
            <div className="ia-bezel-outer ia-slide-up">
              <div className="ia-bezel-inner bg-white overflow-hidden">
                <div className="ia-well border-b border-ia-outline-variant px-5 py-4">
                  <h3 className="font-heading text-sm font-bold tracking-tight text-ia-on-surface flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-ia-primary-container text-ia-on-primary font-mono text-[10px] font-bold">
                      {form.id ? "E" : "+"}
                    </span>
                    <span>{form.id ? "Edit inventory item" : "Add inventory item"}</span>
                  </h3>
                  <p className="text-[11px] text-ia-secondary mt-1 leading-normal">
                    Enter supplier pricing metrics. Margins are calculated automatically.
                  </p>
                </div>

                <div className="p-5">
                  <form onSubmit={handleSubmit} className="space-y-4" id="product-form">

                    <div className="space-y-1.5">
                      <Label htmlFor="product-name" className="text-xs font-semibold text-ia-secondary">
                        Product name
                      </Label>
                      <Input
                        id="product-name"
                        placeholder="e.g. Century Tuna 150g"
                        value={form.name}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, name: event.target.value }))
                        }
                        className="h-10 rounded-lg border border-ia-outline-variant bg-ia-surface text-sm text-ia-on-surface placeholder:text-ia-secondary/40 focus-visible:ring-2 focus-visible:ring-ia-primary-container/20 focus-visible:border-ia-primary-container w-full transition-all ia-focus-ring"
                        required
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="cost-price" className="text-xs font-semibold text-ia-secondary">
                          Cost price (₱)
                        </Label>
                        <div className="relative flex items-center">
                          <span className="absolute left-3 text-ia-secondary/50 text-xs font-medium font-mono" aria-hidden="true">₱</span>
                          <Input
                            id="cost-price"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={form.costPrice}
                            onChange={(event) =>
                              setForm((current) => ({ ...current, costPrice: event.target.value }))
                            }
                            className="h-10 pl-7 rounded-lg border border-ia-outline-variant bg-ia-surface text-sm text-ia-on-surface font-mono placeholder:text-ia-secondary/40 focus-visible:ring-2 focus-visible:ring-ia-primary-container/20 focus-visible:border-ia-primary-container w-full transition-all ia-focus-ring"
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="selling-price" className="text-xs font-semibold text-ia-secondary">
                          Selling price (₱)
                        </Label>
                        <div className="relative flex items-center">
                          <span className="absolute left-3 text-ia-secondary/50 text-xs font-medium font-mono" aria-hidden="true">₱</span>
                          <Input
                            id="selling-price"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={form.sellingPrice}
                            onChange={(event) =>
                              setForm((current) => ({ ...current, sellingPrice: event.target.value }))
                            }
                            className="h-10 pl-7 rounded-lg border border-ia-outline-variant bg-ia-surface text-sm text-ia-on-surface font-mono placeholder:text-ia-secondary/40 focus-visible:ring-2 focus-visible:ring-ia-primary-container/20 focus-visible:border-ia-primary-container w-full transition-all ia-focus-ring"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Markup indicator */}
                    {markupAmount !== null && markupPercent !== null ? (
                      <div className="rounded-lg bg-ia-surface border border-ia-outline-variant p-3 flex items-center justify-between ia-fade-in">
                        <span className="text-xs text-ia-secondary flex items-center gap-1.5 font-semibold">
                          <Info className="size-3.5 text-ia-primary-container" aria-hidden="true" />
                          Gross markup
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-ia-on-surface font-mono font-bold tabular-nums">
                            ₱{markupAmount.toFixed(2)}
                          </span>
                          <MarkupBadge pct={markupPercent} />
                        </div>
                      </div>
                    ) : null}

                    <div className="space-y-1.5">
                      <Label htmlFor="product-note" className="text-xs font-semibold text-ia-secondary">
                        Note <span className="font-normal text-ia-secondary/60">(optional)</span>
                      </Label>
                      <Textarea
                        id="product-note"
                        placeholder="Expiry details, supplier notes, or storage location..."
                        value={form.note}
                        onChange={(event) =>
                          setForm((current) => ({ ...current, note: event.target.value }))
                        }
                        className="min-h-[72px] rounded-lg border border-ia-outline-variant bg-ia-surface text-sm text-ia-on-surface placeholder:text-ia-secondary/40 focus-visible:ring-2 focus-visible:ring-ia-primary-container/20 focus-visible:border-ia-primary-container w-full resize-none p-3 transition-all ia-focus-ring"
                      />
                    </div>

                    <div className="flex gap-2.5 pt-1">
                      <Button
                        id="product-submit-btn"
                        type="submit"
                        disabled={isSaving}
                        className="h-9 px-4 rounded-lg bg-gradient-to-r from-ia-primary-container to-[#b02f00] text-ia-on-primary font-bold text-xs hover:shadow-md hover:brightness-105 active:scale-95 transition-all duration-200 cursor-pointer flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ia-primary-container/30"
                      >
                        {isSaving ? "Saving..." : form.id ? "Update item" : "Create item"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setForm(emptyProductForm);
                          setShowAddForm(false);
                        }}
                        className="h-9 px-4 rounded-lg border border-ia-outline-variant bg-ia-surface-low hover:bg-ia-surface-high text-ia-secondary text-xs font-bold transition-all active:scale-95 cursor-pointer flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ia-primary-container/20"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Price History Timeline */}
          {activeHistoryProductId && (
            <div className="ia-bezel-outer ia-slide-up">
              <div className="ia-bezel-inner bg-white overflow-hidden">
                <div className="ia-well border-b border-ia-outline-variant px-5 py-3.5">
                  <h3 className="font-heading text-sm font-bold tracking-tight text-ia-on-surface flex items-center gap-2">
                    <History className="size-4 text-ia-secondary" aria-hidden="true" />
                    <span>Price history</span>
                  </h3>
                  <p className="text-[11px] text-ia-secondary mt-1 leading-normal">
                    Audit trail for{" "}
                    <span className="font-bold text-ia-on-surface">
                      {products.find((p) => p.id === activeHistoryProductId)?.name}
                    </span>
                  </p>
                </div>
                <div className="p-5">
                  {historyByProductId[activeHistoryProductId]?.length ? (
                    <div className="relative border-l border-ia-outline-variant pl-5 ml-2.5 space-y-5 py-1">
                      {historyByProductId[activeHistoryProductId].map((item, idx) => {
                        const isUp = item.newSellingPrice > item.oldSellingPrice;
                        const isDown = item.newSellingPrice < item.oldSellingPrice;
                        const staggerClasses = [
                          "ia-stagger-1", "ia-stagger-2", "ia-stagger-3",
                          "ia-stagger-4", "ia-stagger-5", "ia-stagger-6",
                        ];

                        return (
                          <div key={item.id} className={`relative ia-slide-up ${staggerClasses[Math.min(idx, 5)]}`}>
                            <span
                              className={`absolute -left-[27.5px] top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-ia-surface-card border ${
                                isUp
                                  ? "border-ia-primary-container text-ia-primary-container"
                                  : isDown
                                  ? "border-ia-error text-ia-error"
                                  : "border-ia-outline-variant text-ia-secondary"
                              }`}
                              aria-hidden="true"
                            >
                              {isUp ? (
                                <TrendingUp className="size-2 text-ia-primary-container" />
                              ) : isDown ? (
                                <TrendingDown className="size-2 text-ia-error" />
                              ) : (
                                <span className="size-1 rounded-full bg-ia-secondary" />
                              )}
                            </span>

                            <div className="space-y-1.5">
                              <span className="text-[10px] font-mono font-medium text-ia-secondary">
                                {new Date(item.changedAt).toLocaleString()}
                              </span>

                              <div className="grid grid-cols-2 gap-2.5 text-xs">
                                <div className="rounded-md border border-ia-outline-variant bg-ia-surface p-2.5">
                                  <p className="text-[10px] text-ia-secondary uppercase font-mono tracking-wider font-bold">Cost</p>
                                  <p className="font-semibold text-ia-on-surface mt-1 font-mono tabular-nums text-[11px]">
                                    ₱{item.oldCostPrice.toFixed(2)} → ₱{item.newCostPrice.toFixed(2)}
                                  </p>
                                </div>
                                <div className="rounded-md border border-ia-outline-variant bg-ia-surface p-2.5">
                                  <p className="text-[10px] text-ia-secondary uppercase font-mono tracking-wider font-bold">Selling</p>
                                  <p className={`font-semibold mt-1 font-mono tabular-nums text-[11px] ${
                                    isUp ? "text-ia-primary-container" : isDown ? "text-ia-error" : "text-ia-on-surface"
                                  }`}>
                                    ₱{item.oldSellingPrice.toFixed(2)} → ₱{item.newSellingPrice.toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-xs text-ia-secondary py-6">
                      No price changes recorded. Logs appear when cost or selling prices are updated.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Right Column: Inventory Table ── */}
        <div className="ia-bezel-outer">
          <div className="ia-bezel-inner bg-white overflow-hidden">
            <div className="ia-well border-b border-ia-outline-variant px-5 py-4">
              <h3 className="font-heading text-sm font-bold tracking-tight text-ia-on-surface flex items-center gap-2">
                <Tag className="size-4 text-ia-secondary" aria-hidden="true" />
                Stock inventory
              </h3>
              <p className="text-[11px] text-ia-secondary mt-1 leading-normal">
                Current pricing metrics and markup spreads across all catalog items.
              </p>
            </div>

            <div className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-ia-surface-high border-b border-ia-outline-variant">
                    <TableRow className="hover:bg-transparent border-b border-ia-outline-variant">
                      <TableHead className="ia-label py-2.5 px-4 h-10">Product</TableHead>
                      <TableHead className="ia-label py-2.5 px-4 h-10">Cost</TableHead>
                      <TableHead className="ia-label py-2.5 px-4 h-10">Selling</TableHead>
                      <TableHead className="ia-label py-2.5 px-4 h-10">Markup</TableHead>
                      <TableHead className="ia-label py-2.5 px-4 h-10 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {products.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-16">
                          <div className="flex flex-col items-center gap-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-ia-surface border border-ia-outline-variant text-ia-secondary">
                              <Tag className="size-5" aria-hidden="true" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-ia-on-surface">No products yet</p>
                              <p className="text-xs text-ia-secondary mt-1">Use the form to catalog your first item.</p>
                            </div>
                            <button
                              onClick={() => { setForm(emptyProductForm); setShowAddForm(true); }}
                              className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-ia-primary-container hover:text-ia-primary transition-colors cursor-pointer"
                            >
                              <Plus className="size-3.5" aria-hidden="true" />
                              Add first product
                            </button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-xs text-ia-secondary">
                          No products match "<span className="font-semibold text-ia-on-surface">{tableSearch}</span>"
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredProducts.map((product, idx) => {
                        const markupAmt = product.sellingPrice - product.costPrice;
                        const markupPct =
                          product.costPrice > 0
                            ? (markupAmt / product.costPrice) * 100
                            : 0;
                        const isHistoryActive = activeHistoryProductId === product.id;

                        return (
                          <TableRow
                            key={product.id}
                            className={`border-b border-ia-outline-variant transition-colors ia-slide-up ia-stagger-${Math.min(idx + 1, 6)} ${
                              isHistoryActive
                                ? "bg-ia-surface-overlay"
                                : "hover:bg-ia-surface-low/60"
                            }`}
                          >
                            <TableCell className="py-3.5 px-4">
                              <div className="font-semibold text-ia-on-surface text-sm leading-snug">
                                {product.name}
                              </div>
                              {product.note ? (
                                <div className="text-[11px] text-ia-secondary italic mt-0.5 leading-relaxed line-clamp-1">
                                  {product.note}
                                </div>
                              ) : null}
                            </TableCell>

                            <TableCell className="py-3.5 px-4 font-mono text-xs text-ia-secondary/90 tabular-nums">
                              ₱{product.costPrice.toFixed(2)}
                            </TableCell>

                            <TableCell className="py-3.5 px-4 font-mono text-sm font-semibold text-ia-on-surface tabular-nums">
                              ₱{product.sellingPrice.toFixed(2)}
                            </TableCell>

                            <TableCell className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[11px] text-ia-secondary tabular-nums">
                                  ₱{markupAmt.toFixed(2)}
                                </span>
                                <MarkupBadge pct={markupPct} />
                              </div>
                            </TableCell>

                            {/* Row actions */}
                            <TableCell className="py-3.5 px-4 text-right">
                              <div className="inline-flex gap-1.5">
                                <Button
                                  id={`edit-product-${product.id}`}
                                  variant="outline"
                                  size="xs"
                                  onClick={() =>
                                    setForm({
                                      id: product.id,
                                      name: product.name,
                                      costPrice: String(product.costPrice),
                                      sellingPrice: String(product.sellingPrice),
                                      note: product.note ?? "",
                                    })
                                  }
                                  className="h-7 w-7 p-0 border border-ia-outline-variant bg-ia-surface-low hover:bg-ia-surface-high hover:text-ia-on-surface rounded-lg transition-all active:scale-90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ia-primary-container/20"
                                  title="Edit item"
                                >
                                  <Edit2 className="size-3" aria-hidden="true" />
                                </Button>
                                <Button
                                  id={`history-product-${product.id}`}
                                  variant="outline"
                                  size="xs"
                                  onClick={() => void handleViewHistory(product.id)}
                                  className={`h-7 w-7 p-0 border rounded-lg transition-all active:scale-90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ia-primary-container/20 ${
                                    isHistoryActive
                                      ? "bg-ia-primary-container border-ia-primary-container text-ia-on-primary hover:bg-ia-primary"
                                      : "border-ia-outline-variant bg-ia-surface-low hover:bg-ia-surface-high text-ia-secondary"
                                  }`}
                                  title="Price logs"
                                >
                                  <History className="size-3" aria-hidden="true" />
                                </Button>
                                <Button
                                  id={`delete-product-${product.id}`}
                                  variant="destructive"
                                  size="xs"
                                  onClick={() => void handleDelete(product.id)}
                                  className="h-7 w-7 p-0 border-0 bg-ia-error-container/20 text-ia-error hover:bg-ia-error-container/40 rounded-lg transition-all active:scale-90 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/20"
                                  title="Delete item"
                                >
                                  <Trash2 className="size-3" aria-hidden="true" />
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

              {/* Table footer */}
              {products.length > 0 && (
                <div className="px-4 py-3 border-t border-ia-outline-variant bg-ia-surface-high flex items-center justify-between">
                  <p className="text-[11px] text-ia-secondary font-mono">
                    {filteredProducts.length} of {products.length} item{products.length !== 1 ? "s" : ""}
                  </p>
                  {tableSearch && (
                    <button
                      onClick={() => setTableSearch("")}
                      className="text-[11px] text-ia-primary-container hover:text-ia-primary font-bold transition-colors cursor-pointer"
                    >
                      Clear filter
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
