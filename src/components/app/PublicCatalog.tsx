import { useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchJson } from "@/lib/client/api";
import type { Product } from "@/lib/types";

export const PublicCatalog = () => {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);

      try {
        const nextProducts = await fetchJson<Product[]>(
          `/api/products?search=${encodeURIComponent(query)}`,
          {
            signal: controller.signal,
          },
        );
        setProducts(nextProducts);
      } catch {
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 md:px-6 md:py-12">
      <section className="grid gap-6 rounded-[2rem] border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur md:grid-cols-[1.4fr_0.8fr] md:p-10">
        <div className="space-y-4">
          <Badge className="rounded-full bg-amber-100 px-3 py-1 text-amber-900 hover:bg-amber-100">
            Vendara
          </Badge>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground md:text-6xl">
            Premium sari-sari price lookup with a cleaner operating rhythm.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
            Search live selling prices instantly while the store owner manages product pricing,
            customer ledgers, and payment history behind the scenes.
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-border/70 bg-background/80 p-5">
          <p className="mb-3 text-sm font-medium text-muted-foreground">Search product</p>
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Coffee, sardines, rice..."
            className="h-12 rounded-2xl"
          />
          <p className="mt-4 text-sm text-muted-foreground">
            {isLoading
              ? "Loading prices..."
              : `${products.length} product${products.length === 1 ? "" : "s"} found`}
          </p>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id} className="rounded-[1.5rem] border-border/70">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current selling price</p>
                  <p className="text-3xl font-semibold tracking-tight">
                    ₱{product.sellingPrice.toFixed(2)}
                  </p>
                </div>
                <Badge variant="secondary" className="rounded-full">
                  Updated
                </Badge>
              </div>
              {product.note ? <p className="text-sm text-muted-foreground">{product.note}</p> : null}
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
};
