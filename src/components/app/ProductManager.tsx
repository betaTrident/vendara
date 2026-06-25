import { useEffect, useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  History,
  Info,
  Tag,
  Search,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : pct >= 40
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : "bg-emerald-50 text-emerald-700 border-emerald-200";

  return (
    <Badge className={`rounded-sm text-[10px] font-semibold px-2 py-0.5 border ${cls} shadow-none`}>
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
    <div className="space-y-6">

      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-text pointer-events-none" aria-hidden="true" />
            <Input
              id="product-table-search"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Filter products..."
              className="h-10 pl-9 pr-8 rounded-sm border border-hairline bg-white text-sm text-ink placeholder:text-muted-text focus-visible:border-ink transition-all"
              aria-label="Filter products"
            />
            {tableSearch && (
              <button
                onClick={() => setTableSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-text hover:text-ink transition-colors cursor-pointer"
                aria-label="Clear search"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>
        <div>
          <Button
            id="add-product-btn"
            type="button"
            onClick={() => {
              setForm(emptyProductForm);
              setShowAddForm((prev) => !prev);
            }}
            className="h-10 px-4 rounded-sm bg-primary text-white font-semibold text-xs hover:bg-primary-hover active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="size-3.5 mr-1.5" aria-hidden="true" />
            {showAddForm && !form.id ? "Cancel" : "Add product"}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] items-start">

        {/* ── Left Column: Form + History ── */}
        <div className="space-y-6">

          {/* Product Form */}
          {(showAddForm || form.id) && (
            <div className="vn-card overflow-hidden">
              <div className="vn-card-header px-5 py-4">
                <h3 className="text-sm font-semibold tracking-tight text-ink flex items-center gap-2 font-heading">
                  <span className="flex h-5 w-5 items-center justify-center rounded-sm bg-primary text-white font-mono text-[10px] font-bold">
                    {form.id ? "E" : "+"}
                  </span>
                  <span>{form.id ? "Edit inventory item" : "Add inventory item"}</span>
                </h3>
                <p className="text-[11px] text-muted-text mt-1 leading-normal">
                  Enter supplier pricing metrics. Margins are calculated automatically.
                </p>
              </div>

              <div className="p-5">
                <form onSubmit={handleSubmit} className="space-y-4" id="product-form">

                  <div className="space-y-1.5">
                    <Label htmlFor="product-name" className="text-xs font-semibold text-ink">
                      Product name
                    </Label>
                    <Input
                      id="product-name"
                      placeholder="e.g. Century Tuna 150g"
                      value={form.name}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, name: event.target.value }))
                      }
                      className="h-10 rounded-sm border border-hairline bg-white text-sm text-ink placeholder:text-muted-text focus-visible:border-ink w-full transition-all"
                      required
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="cost-price" className="text-xs font-semibold text-ink">
                        Cost price (₱)
                      </Label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-muted-text text-xs font-medium font-mono" aria-hidden="true">₱</span>
                        <Input
                          id="cost-price"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={form.costPrice}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, costPrice: event.target.value }))
                          }
                          className="h-10 pl-7 rounded-sm border border-hairline bg-white text-sm text-ink font-mono placeholder:text-muted-text focus-visible:border-ink w-full transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="selling-price" className="text-xs font-semibold text-ink">
                        Selling price (₱)
                      </Label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-muted-text text-xs font-medium font-mono" aria-hidden="true">₱</span>
                        <Input
                          id="selling-price"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={form.sellingPrice}
                          onChange={(event) =>
                            setForm((current) => ({ ...current, sellingPrice: event.target.value }))
                          }
                          className="h-10 pl-7 rounded-sm border border-hairline bg-white text-sm text-ink font-mono placeholder:text-muted-text focus-visible:border-ink w-full transition-all"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Markup indicator */}
                  {markupAmount !== null && markupPercent !== null ? (
                    <div className="rounded-sm bg-surface-soft border border-hairline p-3 flex items-center justify-between">
                      <span className="text-xs text-muted-text flex items-center gap-1.5 font-semibold">
                        <Info className="size-3.5 text-primary" aria-hidden="true" />
                        Gross markup
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-ink font-mono font-bold tabular-nums">
                          ₱{markupAmount.toFixed(2)}
                        </span>
                        <MarkupBadge pct={markupPercent} />
                      </div>
                    </div>
                  ) : null}

                  <div className="space-y-1.5">
                    <Label htmlFor="product-note" className="text-xs font-semibold text-ink">
                      Note <span className="font-normal text-muted-text">(optional)</span>
                    </Label>
                    <Textarea
                      id="product-note"
                      placeholder="Expiry details, supplier notes, or storage location..."
                      value={form.note}
                      onChange={(event) =>
                        setForm((current) => ({ ...current, note: event.target.value }))
                      }
                      className="min-h-[72px] rounded-sm border border-hairline bg-white text-sm text-ink placeholder:text-muted-text focus-visible:border-ink w-full resize-none p-3 transition-all"
                    />
                  </div>

                  <div className="flex gap-2.5 pt-1">
                    <Button
                      id="product-submit-btn"
                      type="submit"
                      disabled={isSaving}
                      className="h-10 px-4 rounded-sm bg-primary text-white font-semibold text-xs hover:bg-primary-hover active:scale-95 transition-all flex-1"
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
                      className="h-10 px-4 rounded-sm border border-hairline bg-white hover:bg-surface-soft text-ink text-xs font-semibold transition-all active:scale-95 flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Price History Timeline */}
          {activeHistoryProductId && (
            <div className="vn-card overflow-hidden">
              <div className="vn-card-header px-5 py-4">
                <h3 className="text-sm font-semibold tracking-tight text-ink flex items-center gap-2 font-heading">
                  <History className="size-4 text-muted-text" aria-hidden="true" />
                  <span>Price history</span>
                </h3>
                <p className="text-[11px] text-muted-text mt-1 leading-normal">
                  Audit trail for{" "}
                  <span className="font-bold text-ink">
                    {products.find((p) => p.id === activeHistoryProductId)?.name}
                  </span>
                </p>
              </div>
              <div className="p-5">
                {historyByProductId[activeHistoryProductId]?.length ? (
                  <div className="vn-timeline-line pl-5 ml-2.5 space-y-5 py-1">
                    {historyByProductId[activeHistoryProductId].map((item) => {
                      const isUp = item.newSellingPrice > item.oldSellingPrice;
                      const isDown = item.newSellingPrice < item.oldSellingPrice;

                      return (
                        <div key={item.id} className="relative">
                          <span
                            className={`vn-timeline-node -left-[25.5px] top-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full ${
                              isUp
                                ? "bg-primary"
                                : isDown
                                ? "bg-destructive"
                                : "bg-muted-text"
                            }`}
                            aria-hidden="true"
                          />

                          <div className="space-y-1.5">
                            <span className="text-[10px] font-mono font-medium text-muted-text">
                              {new Date(item.changedAt).toLocaleString()}
                            </span>

                            <div className="grid grid-cols-2 gap-2.5 text-xs">
                              <div className="rounded-sm border border-hairline bg-surface-soft p-2.5">
                                <p className="text-[10px] text-muted-text uppercase font-mono tracking-wider font-semibold">Cost</p>
                                <p className="font-semibold text-ink mt-1 font-mono tabular-nums text-[11px]">
                                  ₱{item.oldCostPrice.toFixed(2)} → ₱{item.newCostPrice.toFixed(2)}
                                </p>
                              </div>
                              <div className="rounded-sm border border-hairline bg-surface-soft p-2.5">
                                <p className="text-[10px] text-muted-text uppercase font-mono tracking-wider font-semibold">Selling</p>
                                <p className={`font-semibold mt-1 font-mono tabular-nums text-[11px] ${
                                  isUp ? "text-primary" : isDown ? "text-destructive" : "text-ink"
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
                  <p className="text-center text-xs text-muted-text py-6">
                    No price changes recorded. Logs appear when cost or selling prices are updated.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ── Right Column: Inventory Table ── */}
        <div className="vn-card overflow-hidden">
          <div className="vn-card-header px-5 py-4">
            <h3 className="text-sm font-semibold tracking-tight text-ink flex items-center gap-2 font-heading">
              <Tag className="size-4 text-muted-text" aria-hidden="true" />
              Stock inventory
            </h3>
            <p className="text-[11px] text-muted-text mt-1 leading-normal">
              Current pricing metrics and markup spreads across all catalog items.
            </p>
          </div>

          <div className="p-0">
            <div className="overflow-x-auto">
              <Table className="vn-table">
                <TableHeader className="vn-table-header">
                  <TableRow className="hover:bg-transparent border-b border-hairline">
                    <TableHead className="text-xs font-semibold py-2.5 px-4 h-10 text-muted-text">Product</TableHead>
                    <TableHead className="text-xs font-semibold py-2.5 px-4 h-10 text-muted-text">Cost</TableHead>
                    <TableHead className="text-xs font-semibold py-2.5 px-4 h-10 text-muted-text">Selling</TableHead>
                    <TableHead className="text-xs font-semibold py-2.5 px-4 h-10 text-muted-text">Markup</TableHead>
                    <TableHead className="text-xs font-semibold py-2.5 px-4 h-10 text-right text-muted-text w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-16">
                        <div className="flex flex-col items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-sm bg-surface-soft border border-hairline text-muted-text">
                            <Tag className="size-5" aria-hidden="true" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-ink">No products yet</p>
                            <p className="text-xs text-muted-text mt-1">Use the form to catalog your first item.</p>
                          </div>
                          <button
                            onClick={() => { setForm(emptyProductForm); setShowAddForm(true); }}
                            className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline cursor-pointer"
                          >
                            <Plus className="size-3.5" aria-hidden="true" />
                            Add first product
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-xs text-muted-text">
                        No products match "<span className="font-semibold text-ink">{tableSearch}</span>"
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => {
                      const markupAmt = product.sellingPrice - product.costPrice;
                      const markupPct =
                        product.costPrice > 0
                          ? (markupAmt / product.costPrice) * 100
                          : 0;
                      const isHistoryActive = activeHistoryProductId === product.id;

                      return (
                        <TableRow
                          key={product.id}
                          className={`vn-table-row border-b border-hairline-soft ${
                            isHistoryActive
                              ? "bg-surface-soft"
                              : ""
                          }`}
                        >
                          <TableCell className="py-3.5 px-4">
                            <div className="font-semibold text-ink text-sm leading-snug">
                              {product.name}
                            </div>
                            {product.note ? (
                              <div className="text-[11px] text-muted-text italic mt-0.5 leading-relaxed line-clamp-1">
                                {product.note}
                              </div>
                            ) : null}
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
                                className="h-7 w-7 p-0 border border-hairline bg-white hover:bg-surface-soft hover:text-ink rounded-sm transition-all cursor-pointer"
                                title="Edit item"
                              >
                                <Edit2 className="size-3" aria-hidden="true" />
                              </Button>
                              <Button
                                id={`history-product-${product.id}`}
                                variant="outline"
                                size="xs"
                                onClick={() => void handleViewHistory(product.id)}
                                className={`h-7 w-7 p-0 border rounded-sm transition-all cursor-pointer ${
                                  isHistoryActive
                                    ? "bg-primary border-primary text-white hover:bg-primary-hover"
                                    : "border-hairline bg-white hover:bg-surface-soft text-muted-text hover:text-ink"
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
                                className="h-7 w-7 p-0 border border-transparent bg-rose-50 text-destructive hover:bg-rose-100 hover:border-destructive/20 rounded-sm transition-all cursor-pointer"
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
              <div className="px-4 py-3 border-t border-hairline bg-surface-soft flex items-center justify-between">
                <p className="text-[11px] text-muted-text font-mono">
                  {filteredProducts.length} of {products.length} item{products.length !== 1 ? "s" : ""}
                </p>
                {tableSearch && (
                  <button
                    onClick={() => setTableSearch("")}
                    className="text-[11px] text-primary hover:underline font-semibold transition-colors cursor-pointer"
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
  );
};
