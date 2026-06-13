import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, History, TrendingUp, TrendingDown, Info, Tag, DollarSign } from "lucide-react";

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

export const ProductManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [historyByProductId, setHistoryByProductId] = useState<
    Record<string, PriceHistoryItem[]>
  >({});
  const [form, setForm] = useState(emptyProductForm);
  const [isSaving, setIsSaving] = useState(false);
  const [activeHistoryProductId, setActiveHistoryProductId] = useState<string | null>(null);

  const loadProducts = async () => {
    setProducts(await fetchJson<Product[]>("/api/products"));
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

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr] items-start">
      {/* Product Creator Form */}
      <div className="space-y-6">
        <Card className="rounded-[8px] border border-ia-outline-variant bg-ia-surface-card overflow-hidden shadow-sm">
          <CardHeader className="ia-well">
            <CardTitle className="font-heading text-sm font-semibold tracking-tight text-ia-on-surface flex items-center gap-2">
              <span className="flex h-5 w-5 items-center justify-center rounded-[4px] bg-ia-primary-container text-ia-on-primary font-mono text-xs">
                {form.id ? "E" : "+"}
              </span>
              <span>{form.id ? "Edit Inventory Item" : "Add Inventory Item"}</span>
            </CardTitle>
            <CardDescription className="text-xs text-ia-secondary mt-0.5">
              Enter supplier pricing metrics. Margins are calculated dynamically.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="product-name" className="text-xs font-semibold text-ia-secondary">Product Name</Label>
                <Input
                  id="product-name"
                  placeholder="e.g. Century Tuna 150g"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  className="h-10 rounded-[4px] border border-ia-outline bg-ia-surface text-sm text-ia-on-surface placeholder:text-ia-secondary/50 focus-visible:ring-2 focus-visible:ring-ia-primary-container/20 focus-visible:border-ia-primary-container w-full"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="cost-price" className="text-xs font-semibold text-ia-secondary">Cost Price (₱)</Label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-ia-secondary/60 text-xs font-medium">₱</span>
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
                      className="h-10 pl-7 rounded-[4px] border border-ia-outline bg-ia-surface text-sm text-ia-on-surface placeholder:text-ia-secondary/50 focus-visible:ring-2 focus-visible:ring-ia-primary-container/20 focus-visible:border-ia-primary-container w-full"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="selling-price" className="text-xs font-semibold text-ia-secondary">Selling Price (₱)</Label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-ia-secondary/60 text-xs font-medium">₱</span>
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
                      className="h-10 pl-7 rounded-[4px] border border-ia-outline bg-ia-surface text-sm text-ia-on-surface placeholder:text-ia-secondary/50 focus-visible:ring-2 focus-visible:ring-ia-primary-container/20 focus-visible:border-ia-primary-container w-full"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Dynamic Markup Calculation Badge */}
              {form.costPrice && form.sellingPrice ? (
                <div className="rounded-[4px] bg-ia-surface border border-ia-outline-variant p-3 flex items-center justify-between text-xs">
                  <span className="text-ia-secondary flex items-center gap-1 font-medium">
                    <Info className="size-3.5 text-ia-primary-container" />
                    Markup Margin
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-ia-secondary font-mono">
                      ₱{(Number(form.sellingPrice) - Number(form.costPrice)).toFixed(2)}
                    </span>
                    <Badge className="rounded-[4px] ia-chip-orange font-mono border-0 px-2 py-0.5">
                      +{(( (Number(form.sellingPrice) - Number(form.costPrice)) / Number(form.costPrice) ) * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
              ) : null}

              <div className="space-y-1.5">
                <Label htmlFor="product-note" className="text-xs font-semibold text-ia-secondary">Optional Note</Label>
                <Textarea
                  id="product-note"
                  placeholder="Expiry details, supplier notes, or storage shelf location..."
                  value={form.note}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, note: event.target.value }))
                  }
                  className="min-h-18 rounded-[4px] border border-ia-outline bg-ia-surface text-sm text-ia-on-surface placeholder:text-ia-secondary/50 focus-visible:ring-2 focus-visible:ring-ia-primary-container/20 focus-visible:border-ia-primary-container w-full resize-none p-3"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <Button 
                  type="submit" 
                  disabled={isSaving}
                  className="h-9 px-4 rounded-[4px] bg-ia-primary-container text-ia-on-primary font-semibold text-xs transition-colors hover:bg-ia-primary shadow-sm cursor-pointer flex-1"
                >
                  {isSaving ? "Saving..." : form.id ? "Update Item" : "Create Item"}
                </Button>
                {form.id ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setForm(emptyProductForm)}
                    className="h-9 px-4 rounded-[4px] border border-ia-outline bg-ia-surface-card hover:bg-ia-surface hover:text-ia-on-surface text-ia-secondary text-xs font-semibold transition-colors cursor-pointer flex-1"
                  >
                    Cancel
                  </Button>
                ) : null}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Selected Price History Timeline */}
        {activeHistoryProductId && historyByProductId[activeHistoryProductId]?.length ? (
          <Card className="rounded-[8px] border border-ia-outline-variant bg-ia-surface-card shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200">
            <CardHeader className="ia-well py-3 px-5">
              <CardTitle className="font-heading text-sm font-semibold tracking-tight text-ia-on-surface flex items-center gap-2">
                <History className="size-4 text-ia-secondary" />
                <span>Price History Timeline</span>
              </CardTitle>
              <CardDescription className="text-xs text-ia-secondary mt-0.5">
                Audit trail for {products.find(p => p.id === activeHistoryProductId)?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5">
              <div className="relative border-l border-ia-outline-variant pl-5 ml-2.5 space-y-6 py-1">
                {historyByProductId[activeHistoryProductId].map((item) => {
                  const isSellingUp = item.newSellingPrice > item.oldSellingPrice;
                  const isSellingDown = item.newSellingPrice < item.oldSellingPrice;
                  
                  return (
                    <div key={item.id} className="relative">
                      {/* Timeline dot */}
                      <span className={`absolute -left-[27.5px] top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-ia-surface-card border shadow-sm ${
                        isSellingUp ? "border-ia-primary-container text-ia-primary-container" : isSellingDown ? "border-ia-error text-ia-error" : "border-ia-outline-variant text-ia-secondary"
                      }`}>
                        {isSellingUp ? (
                          <TrendingUp className="size-2 text-ia-primary-container" />
                        ) : isSellingDown ? (
                          <TrendingDown className="size-2 text-ia-error" />
                        ) : (
                          <span className="size-1 rounded-full bg-ia-secondary" />
                        )}
                      </span>
                      
                      {/* History details */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-medium text-ia-secondary">
                          {new Date(item.changedAt).toLocaleString()}
                        </span>
                        
                        <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                          <div className="rounded-[4px] border border-ia-outline-variant bg-ia-surface p-2">
                            <p className="text-[10px] text-ia-secondary uppercase font-mono tracking-wider font-semibold">Cost Price</p>
                            <p className="font-medium text-ia-on-surface mt-0.5 font-mono">
                              ₱{item.oldCostPrice.toFixed(2)} → ₱{item.newCostPrice.toFixed(2)}
                            </p>
                          </div>
                          <div className="rounded-[4px] border border-ia-outline-variant bg-ia-surface p-2">
                            <p className="text-[10px] text-ia-secondary uppercase font-mono tracking-wider font-semibold">Selling Price</p>
                            <p className="font-medium text-ia-on-surface mt-0.5 font-mono">
                              ₱{item.oldSellingPrice.toFixed(2)} → ₱{item.newSellingPrice.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ) : activeHistoryProductId ? (
          <Card className="rounded-[8px] border border-ia-outline-variant bg-ia-surface-card p-6 text-center text-xs text-ia-secondary shadow-sm">
            No price logs recorded for this item. Prices are logged when cost or selling prices change.
          </Card>
        ) : null}
      </div>

      {/* Inventory List Table */}
      <Card className="rounded-[8px] border border-ia-outline-variant bg-ia-surface-card overflow-hidden shadow-sm">
        <CardHeader className="ia-well">
          <CardTitle className="font-heading text-sm font-semibold tracking-tight text-ia-on-surface">
            Stock Inventory
          </CardTitle>
          <CardDescription className="text-xs text-ia-secondary mt-0.5">
            Overview of current pricing metrics, markup spreads, and item records.
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
                    <TableCell colSpan={5} className="text-center py-12 text-xs text-ia-secondary">
                      No inventory records yet. Use the form to catalog your first product.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => {
                    const markupAmount = product.sellingPrice - product.costPrice;
                    const markupPercent = product.costPrice > 0 ? (markupAmount / product.costPrice) * 100 : 0;
                    
                    return (
                      <TableRow key={product.id} className="hover:bg-ia-surface-low border-b border-ia-outline-variant transition-colors">
                        <TableCell className="py-3 px-4">
                          <div className="font-medium text-ia-on-surface text-sm">{product.name}</div>
                          {product.note ? (
                            <div className="text-[11px] text-ia-secondary italic mt-0.5 flex items-center gap-1">
                              <span className="size-1 rounded-full bg-ia-outline inline-block" />
                              <span>{product.note}</span>
                            </div>
                          ) : null}
                        </TableCell>
                        <TableCell className="py-3 px-4 font-mono text-xs text-ia-secondary">
                          ₱{product.costPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="py-3 px-4 font-mono text-xs font-semibold text-ia-on-surface">
                          ₱{product.sellingPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="py-3 px-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-xs text-ia-secondary">₱{markupAmount.toFixed(2)}</span>
                            <span className="text-[10px] font-semibold text-ia-primary-container font-mono">+{markupPercent.toFixed(0)}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-4 text-right">
                          <div className="inline-flex gap-1">
                            <Button
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
                              className="h-7 w-7 p-0 border border-ia-outline bg-ia-surface-card hover:bg-ia-surface hover:text-ia-on-surface text-ia-secondary rounded-[4px] transition-colors cursor-pointer"
                              title="Edit item"
                            >
                              <Edit2 className="size-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="xs"
                              onClick={() => void handleViewHistory(product.id)}
                              className={`h-7 w-7 p-0 border rounded-[4px] transition-colors cursor-pointer ${
                                activeHistoryProductId === product.id 
                                  ? "bg-ia-primary-container border-ia-primary-container text-ia-on-primary hover:bg-ia-primary" 
                                  : "border-ia-outline bg-ia-surface-card hover:bg-ia-surface hover:text-ia-on-surface text-ia-secondary"
                              }`}
                              title="Price logs"
                            >
                              <History className="size-3" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="xs"
                              onClick={() => void handleDelete(product.id)}
                              className="h-7 w-7 p-0 border-0 bg-ia-error-container/30 text-ia-error hover:bg-ia-error-container/60 hover:text-ia-error rounded-[4px] transition-colors cursor-pointer"
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
        </CardContent>
      </Card>
    </div>
  );
};
