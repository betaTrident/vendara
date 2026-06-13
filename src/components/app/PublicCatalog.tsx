import { useEffect, useState } from "react";
import { Search, Lock, Tag, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchJson } from "@/lib/client/api";
import type { Product } from "@/lib/types";
import { AppTopBar } from "./AppTopBar";

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
    <div className="relative min-h-screen bg-ia-surface text-ia-on-surface font-sans pb-24">
      {/* Nav Bar Component */}
      <AppTopBar isAuthenticated={false} />

      {/* Hero Band Component */}
      <div className="relative mx-auto max-w-4xl px-4 pt-16 pb-12 text-center md:pt-24 md:pb-16">
        <Badge className="mb-4 rounded-[4px] bg-ia-surface-card border border-ia-outline-variant px-3 py-1 text-xs font-medium text-ia-secondary hover:bg-ia-surface-card">
          Store Pricelist System
        </Badge>
        <h1 className="font-heading text-4xl font-semibold leading-[1.1] tracking-[-1.28px] text-ia-on-surface sm:text-5xl md:text-6xl md:tracking-[-2.4px]">
          Sari-sari price catalog.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-ia-secondary md:text-base md:leading-7">
          Search live selling prices instantly. Real-time product inventory, cost margins,
          and customer credit ledgers are managed behind secure admin credentials.
        </p>

        {/* Search Input Controller */}
        <div className="mx-auto mt-10 w-full max-w-lg">
          <div className="relative rounded-[4px] bg-ia-surface-card p-1.5 border border-ia-outline flex items-center gap-2 transition-all focus-within:ring-2 focus-within:ring-ia-primary-container/20 focus-within:border-ia-primary-container">
            <Search className="size-5 text-ia-secondary/60 ml-3" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Coffee, sardines, shampoo..."
              className="h-11 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0 w-full text-base text-ia-on-surface placeholder:text-ia-secondary/40 focus:outline-none"
            />
          </div>
          <div className="mt-3 text-center text-xs text-ia-secondary/70 font-mono tracking-tight">
            {isLoading ? (
              <span className="inline-flex items-center gap-1">
                <span className="size-1.5 animate-pulse rounded-full bg-ia-primary-container" />
                Loading prices...
              </span>
            ) : (
              <span>{products.length} product{products.length === 1 ? "" : "s"} found</span>
            )}
          </div>
        </div>
      </div>

      {/* Product Catalog Grid */}
      <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
        {products.length === 0 && !isLoading ? (
          <Card className="mx-auto max-w-md border border-ia-outline-variant bg-ia-surface-card text-center p-10 rounded-[8px] shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-ia-surface border border-ia-outline text-ia-secondary mb-4">
              <Search className="size-5" />
            </div>
            <h3 className="text-base font-semibold text-ia-on-surface">No products found</h3>
            <p className="text-sm text-ia-secondary mt-2">
              We couldn't find any products matching "{query}". Try checking your spelling or search another item.
            </p>
          </Card>
        ) : (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <Card
                key={product.id}
                className="group relative flex flex-col justify-between border border-ia-outline-variant bg-ia-surface-card transition-all duration-200 hover:border-ia-primary-container rounded-[8px] overflow-hidden shadow-sm"
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="font-heading text-lg font-semibold tracking-tight text-ia-on-surface group-hover:text-ia-primary-container transition-colors">
                      {product.name}
                    </CardTitle>
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ia-surface border border-ia-outline text-ia-secondary group-hover:bg-ia-primary-container/10 group-hover:text-ia-primary-container group-hover:border-ia-primary-container/20 transition-colors">
                      <Tag className="size-3.5" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 pt-0 space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-ia-secondary uppercase font-mono tracking-wider font-semibold">Selling Price</p>
                      <p className="text-3xl font-semibold tracking-[-0.6px] text-ia-on-surface mt-0.5 font-mono">
                        ₱{product.sellingPrice.toFixed(2)}
                      </p>
                    </div>
                    <Badge variant="secondary" className="rounded-[4px] bg-ia-surface border border-ia-outline text-ia-secondary text-[10px] px-2 py-0.5 flex items-center gap-1 font-mono hover:bg-ia-surface">
                      <Clock className="size-3 text-ia-primary-container" />
                      <span>Updated</span>
                    </Badge>
                  </div>
                  {product.note ? (
                    <div className="rounded-[4px] bg-ia-surface border border-ia-outline-variant p-2.5">
                      <p className="text-xs text-ia-secondary font-medium italic">
                        "{product.note}"
                      </p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </section>
        )}
      </div>
    </div>
  );
};
