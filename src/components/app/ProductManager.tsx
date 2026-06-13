import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    await loadProducts();
  };

  const handleViewHistory = async (productId: string) => {
    const history = await fetchAdminJson<PriceHistoryItem[]>(
      `/api/products/${productId}/history`,
    );
    setHistoryByProductId((current) => ({
      ...current,
      [productId]: history,
    }));
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.45fr]">
      <Card className="rounded-[1.5rem] border-border/70">
        <CardHeader>
          <CardTitle>{form.id ? "Edit product" : "Add product"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Product name"
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
            />
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                type="number"
                step="0.01"
                placeholder="Cost price"
                value={form.costPrice}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    costPrice: event.target.value,
                  }))
                }
              />
              <Input
                type="number"
                step="0.01"
                placeholder="Selling price"
                value={form.sellingPrice}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    sellingPrice: event.target.value,
                  }))
                }
              />
            </div>
            <Textarea
              placeholder="Optional note"
              value={form.note}
              onChange={(event) =>
                setForm((current) => ({ ...current, note: event.target.value }))
              }
            />
            <div className="flex gap-3">
              <Button type="submit" disabled={isSaving}>
                {isSaving
                  ? "Saving..."
                  : form.id
                    ? "Update product"
                    : "Create product"}
              </Button>
              {form.id ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setForm(emptyProductForm)}
                >
                  Cancel
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="rounded-[1.5rem] border-border/70">
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Selling</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="font-medium">{product.name}</div>
                    {product.note ? (
                      <div className="text-xs text-muted-foreground">
                        {product.note}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell>₱{product.costPrice.toFixed(2)}</TableCell>
                  <TableCell>₱{product.sellingPrice.toFixed(2)}</TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() =>
                        setForm({
                          id: product.id,
                          name: product.name,
                          costPrice: String(product.costPrice),
                          sellingPrice: String(product.sellingPrice),
                          note: product.note ?? "",
                        })
                      }
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void handleViewHistory(product.id)}
                    >
                      History
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => void handleDelete(product.id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {products.map((product) =>
            historyByProductId[product.id]?.length ? (
              <Card
                key={`${product.id}-history`}
                className="rounded-2xl border-border/70 bg-muted/40"
              >
                <CardHeader>
                  <CardTitle className="text-base">
                    Price history for {product.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  {historyByProductId[product.id].map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl border border-border/60 bg-background/80 p-3"
                    >
                      <div>
                        Cost: ₱{item.oldCostPrice.toFixed(2)} → ₱
                        {item.newCostPrice.toFixed(2)}
                      </div>
                      <div>
                        Selling: ₱{item.oldSellingPrice.toFixed(2)} → ₱
                        {item.newSellingPrice.toFixed(2)}
                      </div>
                      <div className="mt-1 text-xs">
                        {new Date(item.changedAt).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ) : null,
          )}
        </CardContent>
      </Card>
    </div>
  );
};
