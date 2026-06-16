import { useEffect, useState } from "react";
import { Search, Tag, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { fetchJson } from "@/lib/client/api";
import type { Product } from "@/lib/types";
import { AppTopBar } from "./AppTopBar";

// ── Skeleton card ────────────────────────────────────────────────────────────
const ProductCardSkeleton = ({ delay = 0 }: { delay?: number }) => (
  <div
    className="rounded-lg border border-ia-outline-variant bg-ia-surface-card overflow-hidden"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="ia-skeleton h-4 w-32 rounded" />
        <div className="ia-skeleton h-7 w-7 rounded-full shrink-0" />
      </div>
      <div className="space-y-2">
        <div className="ia-skeleton h-2.5 w-16 rounded" />
        <div className="ia-skeleton h-8 w-24 rounded" />
      </div>
    </div>
  </div>
);

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
    <div className="relative min-h-dvh bg-ia-surface text-ia-on-surface font-sans pb-24">
      <AppTopBar isAuthenticated={false} />

      {/* ── Hero Band ── */}
      <section className="relative mx-auto max-w-4xl px-4 pt-14 pb-12 text-center md:pt-20 md:pb-16">

        {/* Subtle background accent */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-48 opacity-40"
          style={{
            background: "radial-gradient(ellipse 70% 60% at 50% -10%, rgba(255,87,34,0.08) 0%, transparent 70%)",
          }}
        />

        <Badge className="mb-5 rounded-md border border-ia-outline-variant bg-ia-surface-card px-3 py-1 text-[11px] font-semibold text-ia-secondary hover:bg-ia-surface-card shadow-none font-mono tracking-wide">
          STORE PRICELIST
        </Badge>

        <h1 className="font-heading text-4xl font-semibold leading-[1.08] tracking-[-1.5px] text-ia-on-surface sm:text-5xl md:text-[3.5rem] md:tracking-[-2px]">
          Sari-sari price catalog.
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-sm leading-6 text-ia-secondary md:text-base md:leading-7">
          Live selling prices, updated in real time. Customer credit and inventory margins are managed through the admin console.
        </p>

        {/* Search input */}
        <div className="mx-auto mt-10 w-full max-w-lg">
          <div
            className="relative rounded-lg bg-ia-surface-card border border-ia-outline-variant flex items-center gap-2 transition-all duration-200 focus-within:border-ia-primary-container focus-within:ring-2 focus-within:ring-ia-primary-container/15 shadow-sm"
            style={{ padding: "6px 6px 6px 14px" }}
          >
            <Search className="size-4.5 text-ia-secondary/50 shrink-0" />
            <Input
              id="catalog-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Coffee, sardines, shampoo..."
              className="h-10 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0 w-full text-sm text-ia-on-surface placeholder:text-ia-secondary/40 focus:outline-none"
              autoComplete="off"
            />
          </div>

          {/* Result count */}
          <div className="mt-3 text-center text-[11px] text-ia-secondary font-mono tracking-tight h-4">
            {isLoading ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-ia-primary-container animate-pulse" />
                Fetching prices...
              </span>
            ) : (
              <span>
                {products.length} product{products.length !== 1 ? "s" : ""} found
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── Product Grid ── */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        {/* Skeleton loading state */}
        {isLoading ? (
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading products">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} delay={i * 50} />
            ))}
          </section>
        ) : products.length === 0 ? (
          <Card className="mx-auto max-w-sm border border-ia-outline-variant bg-ia-surface-card text-center p-10 rounded-lg shadow-sm">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-ia-surface border border-ia-outline-variant text-ia-secondary mb-4">
              <Search className="size-5" />
            </div>
            <h3 className="text-sm font-semibold text-ia-on-surface">
              {query ? `No results for "${query}"` : "No products yet"}
            </h3>
            <p className="text-xs text-ia-secondary mt-2 leading-relaxed">
              {query
                ? "Try a different search term or check spelling."
                : "Products will appear here once they are added to the catalog."}
            </p>
            {query && (
              <button
                onClick={() => setQuery("")}
                className="mt-4 text-xs font-medium text-ia-primary-container hover:text-ia-primary transition-colors cursor-pointer"
              >
                Clear search
              </button>
            )}
          </Card>
        ) : (
          <section
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            aria-label={`${products.length} products`}
          >
            {products.map((product, index) => (
              <Card
                key={product.id}
                className="group relative flex flex-col justify-between border border-ia-outline-variant bg-ia-surface-card rounded-lg overflow-hidden transition-all duration-200 hover:border-ia-primary-container/40 hover:shadow-md shadow-sm ia-slide-up"
                style={{ animationDelay: `${Math.min(index * 40, 200)}ms` }}
              >
                {/* Top accent bar on hover */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-ia-primary-container scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-t-full" />

                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="font-heading text-base font-semibold tracking-tight text-ia-on-surface leading-snug group-hover:text-ia-primary transition-colors">
                      {product.name}
                    </CardTitle>
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-ia-surface border border-ia-outline-variant text-ia-secondary group-hover:bg-ia-primary-container/8 group-hover:text-ia-primary-container group-hover:border-ia-primary-container/20 transition-all">
                      <Tag className="size-3.5" />
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-5 pt-0 space-y-3">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-[10px] text-ia-secondary uppercase font-mono tracking-wider font-bold">
                        Selling Price
                      </p>
                      <p className="text-[1.75rem] font-semibold tracking-[-0.5px] text-ia-on-surface mt-0.5 font-mono tabular-nums leading-none">
                        ₱{product.sellingPrice.toFixed(2)}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className="rounded-md bg-ia-surface border border-ia-outline-variant text-ia-secondary text-[10px] px-2 py-1 flex items-center gap-1 font-mono hover:bg-ia-surface shadow-none"
                    >
                      <Clock className="size-3 text-ia-primary-container" />
                      <span>Updated</span>
                    </Badge>
                  </div>

                  {product.note ? (
                    <div className="rounded-md bg-ia-surface border border-ia-outline-variant p-2.5">
                      <p className="text-xs text-ia-secondary leading-relaxed italic">
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
