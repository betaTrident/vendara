import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, History, TrendingUp, TrendingDown, Info, Tag } from "lucide-react";

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

export const ProductManager = ({ onStatsChange }: ProductManagerProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [historyByProductId, setHistoryByProductId] = useState<
    Record<string, PriceHistoryItem[]>
  >({});
  const [form, setForm] = useState(emptyProductForm);
  const [isSaving, setIsSaving] = useState(false);
  const [activeHistoryProductId, setActiveHistoryProductId] = useState<string | null>(null);

  const loadProducts = async () => {
    const data = await fetchJson<Product[]>("/api/products");
    setProducts(data);
    onStatsChange?.(data.length);
  };

  useEffect(() => {
    void loadProducts();
  }, []);

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
      await loadProducts();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (productId: string) => {
    await fetchAdminJson(`/api/products/${productId}`, {
      method: "DELETE",
    });
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

  const markupAmount = form.costPrice && form.sellingPrice
    ? Number(form.sellingPrice) - Number(form.costPrice)
    : null;
  const markupPercent = markupAmount !== null && Number(form.costPrice) > 0
    ? (markupAmount / Number(form.costPrice)) * 100
    : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] items-start">

      {/* ── Left Column: Form + History ── */}
      <div className="space-y-4">

        {/* Product Form */}
        <Card className="rounded-lg border border-ia-outline-variant bg-ia-surface-card overflow-hidden shadow-sm">
          <CardHeader className="ia-well">
            <CardTitle className="font-heading text-sm font-semibold tracking-tight text-ia-on-surface flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-ia-primary-container text-ia-on-primary font-mono text-[11px] font-bold">
                {form.id ? "E" : "+"}
              </span>
              <span>{form.id ? "Edit inventory item" : "Add inventory item"}</span>
            </CardTitle>
            <CardDescription className="text-xs text-ia-secondary mt-0.5">
              Enter supplier pricing metrics. Margins are calculated automatically.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-5">
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
                  className="h-10 rounded-md border border-ia-outline-variant bg-ia-surface text-sm text-ia-on-surface placeholder:text-ia-secondary/40 focus-visible:ring-1 focus-visible:ring-ia-primary-container focus-visible:border-ia-primary-container w-full transition-colors"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="cost-price" className="text-xs font-semibold text-ia-secondary">
                    Cost price (₱)
                  </Label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-ia-secondary/50 text-xs font-medium font-mono">₱</span>
                    <Input
                      id="cost-price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={form.costPrice}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          costPrice: event.target.value,
                        }))
                      }
                      className="h-10 pl-7 rounded-md border border-ia-outline-variant bg-ia-surface text-sm text-ia-on-surface font-mono placeholder:text-ia-secondary/40 focus-visible:ring-1 focus-visible:ring-ia-primary-container focus-visible:border-ia-primary-container w-full transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="selling-price" className="text-xs font-semibold text-ia-secondary">
                    Selling price (₱)
                  </Label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-ia-secondary/50 text-xs font-medium font-mono">₱</span>
                    <Input
                      id="selling-price"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={form.sellingPrice}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          sellingPrice: event.target.value,
                        }))
                      }
                      className="h-10 pl-7 rounded-md border border-ia-outline-variant bg-ia-surface text-sm text-ia-on-surface font-mono placeholder:text-ia-secondary/40 focus-visible:ring-1 focus-visible:ring-ia-primary-container focus-visible:border-ia-primary-container w-full transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Markup indicator */}
              {markupAmount !== null && markupPercent !== null ? (
                <div className="rounded-md bg-ia-surface border border-ia-outline-variant p-3 flex items-center justify-between ia-fade-in">
                  <span className="text-xs text-ia-secondary flex items-center gap-1.5 font-medium">
                    <Info className="size-3.5 text-ia-primary-container" />
                    Gross markup
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-ia-on-surface font-mono font-semibold tabular-nums">
                      ₱{markupAmount.toFixed(2)}
                    </span>
                    <Badge
                      className={`rounded-md text-[10px] font-mono font-semibold px-2 py-0.5 border-0 ${
                        markupPercent >= 0 ? "ia-chip-orange" : "ia-chip-red"
                      }`}
                    >
                      {markupPercent >= 0 ? "+" : ""}{markupPercent.toFixed(0)}%
                    </Badge>
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
                  className="min-h-[72px] rounded-md border border-ia-outline-variant bg-ia-surface text-sm text-ia-on-surface placeholder:text-ia-secondary/40 focus-visible:ring-1 focus-visible:ring-ia-primary-container focus-visible:border-ia-primary-container w-full resize-none p-3 transition-colors"
                />
              </div>

              <div className="flex gap-2.5 pt-1">
                <Button
                  id="product-submit-btn"
                  type="submit"
                  disabled={isSaving}
                  className="h-9 px-4 rounded-md bg-ia-primary-container text-ia-on-primary font-semibold text-xs transition-all hover:bg-ia-primary active:scale-[0.97] shadow-sm cursor-pointer flex-1"
                >
                  {isSaving ? "Saving..." : form.id ? "Update item" : "Create item"}
                </Button>
                {form.id ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setForm(emptyProductForm)}
                    className="h-9 px-4 rounded-md border border-ia-outline-variant bg-ia-surface-card hover:bg-ia-surface text-ia-secondary text-xs font-semibold transition-colors cursor-pointer flex-1"
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Price History Timeline */}
        {activeHistoryProductId && (
          <Card className="rounded-lg border border-ia-outline-variant bg-ia-surface-card shadow-sm overflow-hidden ia-slide-up">
            <CardHeader className="ia-well py-3 px-5">
              <CardTitle className="font-heading text-sm font-semibold tracking-tight text-ia-on-surface flex items-center gap-2">
                <History className="size-4 text-ia-secondary" />
                <span>Price history</span>
              </CardTitle>
              <CardDescription className="text-xs text-ia-secondary mt-0.5">
                Audit trail for{" "}
                <span className="font-semibold text-ia-on-surface">
                  {products.find((p) => p.id === activeHistoryProductId)?.name}
                </span>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              {historyByProductId[activeHistoryProductId]?.length ? (
                <div className="relative border-l border-ia-outline-variant pl-5 ml-2.5 space-y-5 py-1">
                  {historyByProductId[activeHistoryProductId].map((item, idx) => {
                    const isUp = item.newSellingPrice > item.oldSellingPrice;
                    const isDown = item.newSellingPrice < item.oldSellingPrice;
                    const staggerClasses = ["ia-stagger-1", "ia-stagger-2", "ia-stagger-3", "ia-stagger-4", "ia-stagger-5", "ia-stagger-6"];
                    const staggerClass = staggerClasses[Math.min(idx, 5)];

                    return (
                      <div key={item.id} className={`relative ia-slide-up ${staggerClass}`}>
                        {/* Timeline dot */}
                        <span className={`absolute -left-[27.5px] top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-ia-surface-card border ${
                          isUp
                            ? "border-ia-primary-container text-ia-primary-container"
                            : isDown
                            ? "border-ia-error text-ia-error"
                            : "border-ia-outline-variant text-ia-secondary"
                        }`}>
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
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Right Column: Inventory Table ── */}
      <Card className="rounded-lg border border-ia-outline-variant bg-ia-surface-card overflow-hidden shadow-sm">
        <CardHeader className="ia-well">
          <CardTitle className="font-heading text-sm font-semibold tracking-tight text-ia-on-surface flex items-center gap-2">
            <Tag className="size-4 text-ia-secondary" />
            Stock inventory
          </CardTitle>
          <CardDescription className="text-xs text-ia-secondary mt-0.5">
            Current pricing metrics and markup spreads across all catalog items.
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-ia-surface-high border-b border-ia-outline-variant">
                <TableRow className="hover:bg-transparent border-b border-ia-outline-variant">
                  <TableHead className="ia-label py-2 px-4 h-9">Product</TableHead>
                  <TableHead className="ia-label py-2 px-4 h-9">Cost</TableHead>
                  <TableHead className="ia-label py-2 px-4 h-9">Selling</TableHead>
                  <TableHead className="ia-label py-2 px-4 h-9">Markup</TableHead>
                  <TableHead className="ia-label py-2 px-4 h-9 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-14">
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ia-surface border border-ia-outline-variant text-ia-secondary">
                          <Tag className="size-5" />
                        </div>
                        <p className="text-xs font-semibold text-ia-on-surface">No products yet</p>
                        <p className="text-xs text-ia-secondary">Use the form to catalog your first item.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => {
                    const markupAmt = product.sellingPrice - product.costPrice;
                    const markupPct = product.costPrice > 0
                      ? (markupAmt / product.costPrice) * 100
                      : 0;
                    const isHistoryActive = activeHistoryProductId === product.id;

                    return (
                      <TableRow
                        key={product.id}
                        className={`border-b border-ia-outline-variant transition-colors ${
                          isHistoryActive ? "bg-ia-surface-low" : "hover:bg-ia-surface-low/60"
                        }`}
                      >
                        <TableCell className="py-3 px-4">
                          <div className="font-medium text-ia-on-surface text-sm leading-snug">
                            {product.name}
                          </div>
                          {product.note ? (
                            <div className="text-[11px] text-ia-secondary italic mt-0.5 leading-relaxed line-clamp-1">
                              {product.note}
                            </div>
                          ) : null}
                        </TableCell>

                        <TableCell className="py-3 px-4 font-mono text-xs text-ia-secondary tabular-nums">
                          ₱{product.costPrice.toFixed(2)}
                        </TableCell>

                        <TableCell className="py-3 px-4 font-mono text-sm font-semibold text-ia-on-surface tabular-nums">
                          ₱{product.sellingPrice.toFixed(2)}
                        </TableCell>

                        <TableCell className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] text-ia-secondary tabular-nums">
                              ₱{markupAmt.toFixed(2)}
                            </span>
                            <Badge className="rounded-md ia-chip-orange font-mono border-0 text-[10px] px-1.5 py-0.5 font-semibold">
                              +{markupPct.toFixed(0)}%
                            </Badge>
                          </div>
                        </TableCell>

                        <TableCell className="py-3 px-4 text-right">
                          <div className="inline-flex gap-1">
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
                              className="h-7 w-7 p-0 border border-ia-outline-variant bg-ia-surface-card hover:bg-ia-surface text-ia-secondary rounded-md transition-colors cursor-pointer"
                              title="Edit item"
                            >
                              <Edit2 className="size-3" />
                            </Button>
                            <Button
                              id={`history-product-${product.id}`}
                              variant="outline"
                              size="xs"
                              onClick={() => void handleViewHistory(product.id)}
                              className={`h-7 w-7 p-0 border rounded-md transition-colors cursor-pointer ${
                                isHistoryActive
                                  ? "bg-ia-primary-container border-ia-primary-container text-ia-on-primary hover:bg-ia-primary"
                                  : "border-ia-outline-variant bg-ia-surface-card hover:bg-ia-surface text-ia-secondary"
                              }`}
                              title="Price logs"
                            >
                              <History className="size-3" />
                            </Button>
                            <Button
                              id={`delete-product-${product.id}`}
                              variant="destructive"
                              size="xs"
                              onClick={() => void handleDelete(product.id)}
                              className="h-7 w-7 p-0 border-0 bg-ia-error-container/20 text-ia-error hover:bg-ia-error-container/50 rounded-md transition-colors cursor-pointer"
                              title="Delete item"
                            >
                              <Trash2 className="size-3" />
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

          {/* Table footer: product count */}
          {products.length > 0 && (
            <div className="px-4 py-3 border-t border-ia-outline-variant bg-ia-surface-high">
              <p className="text-[11px] text-ia-secondary font-mono">
                {products.length} item{products.length !== 1 ? "s" : ""} in catalog
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
