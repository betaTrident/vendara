import { useEffect, useState, useMemo } from "react";
import { Search, Tag, Package } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { fetchJson } from "@/lib/client/api";
import type { Product } from "@/lib/types";
import { AppTopBar } from "./AppTopBar";

// ── Derived category helpers ──────────────────────────────────────────────────
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  Beverages:   ["milo", "nestea", "coffee", "juice", "soda", "water", "drinks", "c2", "gatorade", "royal", "sprite", "coke", "pepsi", "mountain dew", "iced", "bear brand", "nescafe", "kopiko"],
  "Canned Goods": ["sardines", "tuna", "corned", "spam", "liver spread", "condensed", "evaporated", "coconut milk", "tomato", "century", "ligo", "argentina"],
  Snacks:      ["chips", "biscuit", "crackers", "piattos", "nova", "oishi", "skyflakes", "fudgee", "rebisco", "potato", "corn", "popcorn", "candy", "chocolate", "gummy"],
  Hygiene:     ["shampoo", "conditioner", "soap", "lotion", "toothpaste", "toothbrush", "deodorant", "detergent", "fabric", "softener", "safeguard", "palmolive", "head"],
  Noodles:     ["noodles", "mami", "pancit", "ramen", "spaghetti", "pasta", "lucky me", "lucky me", "payless"],
  Rice:        ["rice", "bigas"],
  Condiments:  ["vinegar", "soy sauce", "fish sauce", "ketchup", "mayonnaise", "sugar", "salt", "seasoning", "knorr", "ajinomoto", "magic sarap"],
};

const ALL_CATEGORIES = ["All", ...Object.keys(CATEGORY_KEYWORDS)];

function deriveCategory(name: string): string {
  const lower = name.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return category;
  }
  return "Other";
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
const ProductCardSkeleton = ({ delay = 0 }: { delay?: number }) => (
  <div
    className="ia-product-card"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="p-5 space-y-4">
      <div className="ia-skeleton h-4 w-32 rounded" />
      <div className="ia-skeleton h-2 w-16 rounded" />
      <div className="space-y-1">
        <div className="ia-skeleton h-2 w-20 rounded" />
        <div className="ia-skeleton h-8 w-24 rounded" />
      </div>
    </div>
  </div>
);

// ── Product card ──────────────────────────────────────────────────────────────
const ProductCard = ({
  product,
  index,
}: {
  product: Product;
  index: number;
}) => {
  const category = deriveCategory(product.name);

  return (
    <div
      className="ia-product-card ia-slide-up"
      style={{ animationDelay: `${Math.min(index * 40, 240)}ms` }}
    >
      {/* Hover top accent bar */}
      <div className="ia-product-card__accent" aria-hidden="true" />

      <div className="p-5 flex flex-col gap-3 h-full">
        {/* Header row: name + icon */}
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-semibold text-sm leading-snug text-ia-on-surface flex-1 tracking-[-0.2px]">
            {product.name}
          </h3>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-ia-surface border border-ia-outline-variant text-ia-secondary transition-all group-hover:text-ia-primary-container">
            <Tag className="size-3.5" />
          </div>
        </div>

        {/* Category badge */}
        {category !== "Other" && (
          <span className="inline-flex self-start items-center px-2 py-0.5 rounded text-[10px] font-bold tracking-[0.06em] uppercase bg-ia-surface border border-ia-outline-variant text-ia-secondary font-mono">
            {category}
          </span>
        )}

        {/* Price block */}
        <div className="mt-auto pt-2 border-t border-ia-outline-variant">
          <p className="text-[10px] font-bold uppercase tracking-[0.07em] text-ia-secondary font-mono mb-1">
            Selling Price
          </p>
          <p className="text-[1.875rem] font-semibold tracking-tight text-ia-on-surface font-mono tabular-nums leading-none">
            ₱{product.sellingPrice.toFixed(2)}
          </p>
        </div>

        {/* Note */}
        {product.note ? (
          <div className="rounded-md bg-ia-surface border border-ia-outline-variant px-3 py-2">
            <p className="text-xs text-ia-secondary leading-relaxed italic line-clamp-2">
              "{product.note}"
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
export const PublicCatalog = () => {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);

      try {
        const nextProducts = await fetchJson<Product[]>(
          `/api/products?search=${encodeURIComponent(query)}`,
          { signal: controller.signal },
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

  // Filter by active category client-side
  const filteredProducts = useMemo(() => {
    if (activeCategory === "All") return products;
    return products.filter(
      (p) => deriveCategory(p.name) === activeCategory,
    );
  }, [products, activeCategory]);

  return (
    <div className="relative min-h-dvh bg-ia-surface text-ia-on-surface font-sans pb-24">
      <AppTopBar isAuthenticated={false} />

      {/* ── Hero Band ── */}
      <section className="relative mx-auto max-w-4xl px-4 pt-16 pb-12 text-center md:pt-24 md:pb-16">

        {/* Radial orange background glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-64 opacity-60"
          style={{
            background: "radial-gradient(ellipse 80% 70% at 50% -5%, rgba(255,87,34,0.07) 0%, transparent 70%)",
          }}
        />

        {/* Badge */}
        <div className="mb-6 flex justify-center">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-ia-outline-variant bg-ia-surface-card px-3 py-1 text-[11px] font-bold text-ia-secondary font-mono tracking-widest uppercase">
            <Package className="size-3 text-ia-primary-container" aria-hidden="true" />
            Store Pricelist
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-heading text-[2.5rem] sm:text-[3rem] md:text-[3.5rem] font-semibold leading-[1.05] tracking-[-1.5px] md:tracking-[-2px] text-ia-on-surface">
          Sari-sari price catalog.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-sm leading-7 text-ia-secondary md:text-base">
          Live selling prices, updated in real time. Browse, search, and find what you need.
        </p>

        {/* Search bar */}
        <div className="mx-auto mt-10 w-full max-w-xl">
          <div
            className="relative rounded-lg bg-ia-surface-card border border-ia-outline-variant flex items-center gap-2 transition-all duration-200 focus-within:border-ia-primary-container focus-within:ring-[3px] focus-within:ring-ia-primary-container/15"
            style={{
              padding: "8px 8px 8px 16px",
              boxShadow: "var(--shadow-card)",
            }}
          >
            <Search className="size-4.5 text-ia-secondary/50 shrink-0" aria-hidden="true" />
            <Input
              id="catalog-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search coffee, sardines, shampoo..."
              className="h-10 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0 w-full text-sm text-ia-on-surface placeholder:text-ia-secondary/40 focus:outline-none"
              autoComplete="off"
              aria-label="Search products"
            />
          </div>

          {/* Category filter chips */}
          <div
            className="mt-4 flex gap-2 overflow-x-auto pb-1"
            style={{ scrollbarWidth: "none" }}
            role="group"
            aria-label="Filter by category"
          >
            {ALL_CATEGORIES.map((cat) => (
              <button
                key={cat}
                className="ia-filter-chip"
                data-active={activeCategory === cat ? "true" : "false"}
                onClick={() => setActiveCategory(cat)}
                aria-pressed={activeCategory === cat}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Result count */}
          <div className="mt-3 text-left text-[11px] text-ia-secondary font-mono tracking-tight h-4">
            {isLoading ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-ia-primary-container animate-pulse" aria-hidden="true" />
                Fetching prices...
              </span>
            ) : (
              <span>
                {filteredProducts.length} product{filteredProducts.length !== 1 ? "s" : ""} found
                {activeCategory !== "All" ? ` in ${activeCategory}` : ""}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── Product Grid ── */}
      <div className="mx-auto max-w-6xl px-4 sm:px-6">

        {/* Skeleton loading state */}
        {isLoading ? (
          <section
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            aria-label="Loading products"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <ProductCardSkeleton key={i} delay={i * 50} />
            ))}
          </section>
        ) : filteredProducts.length === 0 ? (
          <div className="mx-auto max-w-sm text-center py-16 ia-fade-in">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-ia-surface-card border border-ia-outline-variant text-ia-secondary mb-5">
              <Search className="size-5" aria-hidden="true" />
            </div>
            <h3 className="text-sm font-semibold text-ia-on-surface">
              {query
                ? `No results for "${query}"`
                : activeCategory !== "All"
                ? `No products in ${activeCategory}`
                : "No products yet"}
            </h3>
            <p className="text-xs text-ia-secondary mt-2 leading-relaxed max-w-xs mx-auto">
              {query
                ? "Try a different search term or check spelling."
                : activeCategory !== "All"
                ? "Try browsing a different category."
                : "Products will appear here once they are added to the catalog."}
            </p>
            {(query || activeCategory !== "All") && (
              <button
                onClick={() => { setQuery(""); setActiveCategory("All"); }}
                className="mt-4 text-xs font-semibold text-ia-primary-container hover:text-ia-primary transition-colors cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <section
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
            aria-label={`${filteredProducts.length} products`}
          >
            {filteredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </section>
        )}
      </div>
    </div>
  );
};
