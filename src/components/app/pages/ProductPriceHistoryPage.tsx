import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { PageHeader } from "@/components/app/layout/PageHeader";
import { MarkupBadge } from "@/components/app/products/MarkupBadge";
import { PriceTrendChart } from "@/components/app/products/PriceTrendChart";
import { ProductMediaPlaceholder } from "@/components/app/products/ProductMediaPlaceholder";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { buildAdminHref } from "@/lib/admin/routes";
import { fetchAdminJson } from "@/lib/client/api";
import {
  buildPriceTrendSeries,
  computeMarkupPercent,
  type PriceHistoryRange,
  summarizePriceHistory,
} from "@/lib/domain/pricing";
import type { PriceHistoryItem, Product } from "@/lib/types";

interface ProductPriceHistoryPageProps {
  productId: string;
  onNavigate: (href: string) => void;
}

type HistoryResponse = {
  items: PriceHistoryItem[];
  total: number;
};

const RANGES: { id: PriceHistoryRange; label: string }[] = [
  { id: "7d", label: "7D" },
  { id: "30d", label: "30D" },
  { id: "90d", label: "90D" },
  { id: "all", label: "All" },
];

const PAGE_SIZE = 20;

function formatWhen(value: string | null): string {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) {
    return "—";
  }
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function deltaLabel(previous: number, next: number): string {
  const delta = next - previous;
  if (delta === 0) {
    return "no change";
  }
  const arrow = delta > 0 ? "up" : "down";
  return `${arrow} ₱${Math.abs(delta).toFixed(2)}`;
}

export function ProductPriceHistoryPage({
  productId,
  onNavigate,
}: ProductPriceHistoryPageProps) {
  const [product, setProduct] = useState<Product | null>(null);
  const [history, setHistory] = useState<PriceHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [range, setRange] = useState<PriceHistoryRange>("30d");
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const productsHref = buildAdminHref({ name: "products" });

  const load = async (nextOffset: number, replace: boolean) => {
    setError(null);
    try {
      const [productResult, historyResult] = await Promise.all([
        fetchAdminJson<Product>(`/api/products/${productId}`),
        fetchAdminJson<HistoryResponse>(
          `/api/products/${productId}/history?range=${range}&limit=${PAGE_SIZE}&offset=${nextOffset}`,
        ),
      ]);

      setProduct(productResult);
      setTotal(historyResult.total);
      setHistory((current) =>
        replace ? historyResult.items : [...current, ...historyResult.items],
      );
      setOffset(nextOffset);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load price history.",
      );
      setProduct(null);
      setHistory([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setHistory([]);
    setOffset(0);
    void load(0, true);
  }, [productId, range]);

  const summary = useMemo(() => {
    const derived = summarizePriceHistory(
      history,
      product
        ? {
            costPrice: product.costPrice,
            sellingPrice: product.sellingPrice,
          }
        : undefined,
    );

    return {
      ...derived,
      totalChanges: total,
    };
  }, [history, product, total]);

  const trendPoints = useMemo(
    () =>
      buildPriceTrendSeries(
        history,
        product
          ? {
              costPrice: product.costPrice,
              sellingPrice: product.sellingPrice,
              updatedAt: product.updatedAt,
            }
          : undefined,
      ),
    [history, product],
  );

  const chartSummary = useMemo(() => {
    if (trendPoints.length === 0) {
      return "No price trend data available for the selected range.";
    }
    const first = trendPoints[0];
    const last = trendPoints[trendPoints.length - 1];
    return `Price trend over ${trendPoints.length} points. Cost moved from ₱${first.costPrice.toFixed(2)} to ₱${last.costPrice.toFixed(2)}. Selling moved from ₱${first.sellingPrice.toFixed(2)} to ₱${last.sellingPrice.toFixed(2)}.`;
  }, [trendPoints]);

  const currentMarkup = product
    ? computeMarkupPercent(product.costPrice, product.sellingPrice)
    : null;

  if (loading && !product) {
    return (
      <div className="space-y-6" aria-busy="true">
        <div className="vn-skeleton h-8 w-48" />
        <div className="vn-skeleton h-28 w-full rounded-md" />
        <div className="vn-skeleton h-48 w-full rounded-md" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="space-y-4">
        <Button
          type="button"
          variant="ghost"
          className="h-11 px-2"
          onClick={() => onNavigate(productsHref)}
        >
          <ArrowLeft className="size-4 mr-1.5" aria-hidden="true" />
          Back to Products
        </Button>
        <div
          role="alert"
          className="vn-card p-6 space-y-2"
        >
          <h1 className="text-lg font-semibold text-ink font-heading">
            Product not found
          </h1>
          <p className="text-sm text-muted-text">
            {error ??
              "This product is missing or inactive. Return to the catalog and try another item."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button
          type="button"
          variant="ghost"
          className="h-11 px-2 mb-2"
          onClick={() => onNavigate(productsHref)}
        >
          <ArrowLeft className="size-4 mr-1.5" aria-hidden="true" />
          Back to Products
        </Button>
        <PageHeader
          title="Price history"
          description="Audit cost and selling price changes for this product."
        />
      </div>

      <section className="vn-card p-5" aria-label="Current product pricing">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <ProductMediaPlaceholder />
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-ink font-heading truncate">
                {product.name}
              </h2>
              <p className="text-xs text-muted-text mt-1">
                Last updated {formatWhen(product.updatedAt)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 w-full sm:w-auto sm:min-w-[320px]">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-text font-semibold">
                Cost
              </p>
              <p className="font-mono tabular-nums text-sm font-semibold text-ink mt-1">
                ₱{product.costPrice.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-text font-semibold">
                Selling
              </p>
              <p className="font-mono tabular-nums text-sm font-semibold text-ink mt-1">
                ₱{product.sellingPrice.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-muted-text font-semibold">
                Markup
              </p>
              <div className="mt-1">
                <MarkupBadge percent={currentMarkup} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div
        className="grid gap-3 sm:grid-cols-3"
        aria-label="Price history metrics"
      >
        <div className="vn-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-text font-semibold">
            Total changes
          </p>
          <p className="text-xl font-semibold tabular-nums text-ink mt-2">
            {summary.totalChanges}
          </p>
          <p className="text-xs text-muted-text mt-1">In selected range</p>
        </div>
        <div className="vn-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-text font-semibold">
            Latest update
          </p>
          <p className="text-sm font-semibold text-ink mt-2">
            {formatWhen(summary.latestUpdate)}
          </p>
          <p className="text-xs text-muted-text mt-1">Most recent change</p>
        </div>
        <div className="vn-card p-4">
          <p className="text-[10px] uppercase tracking-wider text-muted-text font-semibold">
            Average markup
          </p>
          <p className="text-xl font-semibold tabular-nums text-ink mt-2">
            {summary.averageMarkup !== null
              ? `${summary.averageMarkup.toFixed(1)}%`
              : "—"}
          </p>
          <p className="text-xs text-muted-text mt-1">
            {history.length < total
              ? "From loaded history rows"
              : "From recorded prices"}
          </p>
        </div>
      </div>

      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="History time range"
      >
        {RANGES.map((item) => (
          <Button
            key={item.id}
            type="button"
            variant={range === item.id ? "default" : "outline"}
            className="h-11 min-w-14 text-xs font-semibold"
            aria-pressed={range === item.id}
            onClick={() => setRange(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      <PriceTrendChart points={trendPoints} summaryText={chartSummary} />

      <section className="vn-card overflow-hidden hidden md:block">
        <div className="px-5 py-4 border-b border-hairline">
          <h3 className="text-sm font-semibold text-ink font-heading">
            Price change history
          </h3>
          <p className="text-xs text-muted-text mt-1">
            Keyboard-readable table of cost and selling changes.
          </p>
        </div>
        <div className="overflow-x-auto">
          <Table aria-label="Price change history">
            <TableHeader>
              <TableRow>
                <TableHead>Date & time</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Selling</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-10 text-xs text-muted-text">
                    No price changes recorded for this range.
                  </TableCell>
                </TableRow>
              ) : (
                history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="text-xs text-muted-text">
                      {formatWhen(item.changedAt)}
                    </TableCell>
                    <TableCell className="font-mono text-xs tabular-nums">
                      ₱{item.oldCostPrice.toFixed(2)} → ₱
                      {item.newCostPrice.toFixed(2)}{" "}
                      <span className="text-muted-text">
                        ({deltaLabel(item.oldCostPrice, item.newCostPrice)})
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs tabular-nums">
                      ₱{item.oldSellingPrice.toFixed(2)} → ₱
                      {item.newSellingPrice.toFixed(2)}{" "}
                      <span className="text-muted-text">
                        (
                        {deltaLabel(
                          item.oldSellingPrice,
                          item.newSellingPrice,
                        )}
                        )
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="space-y-3 md:hidden" aria-label="Price change timeline">
        {history.length === 0 ? (
          <div className="vn-card p-6 text-center text-xs text-muted-text">
            No price changes recorded for this range.
          </div>
        ) : (
          <ul className="space-y-3">
            {history.map((item) => (
              <li key={item.id} className="vn-card p-4 space-y-2">
                <p className="text-[11px] font-mono text-muted-text">
                  {formatWhen(item.changedAt)}
                </p>
                <p className="text-xs text-ink">
                  Cost: ₱{item.oldCostPrice.toFixed(2)} → ₱
                  {item.newCostPrice.toFixed(2)}
                </p>
                <p className="text-xs text-ink">
                  Selling: ₱{item.oldSellingPrice.toFixed(2)} → ₱
                  {item.newSellingPrice.toFixed(2)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {history.length < total ? (
        <div className="flex justify-center">
          <Button
            type="button"
            variant="outline"
            className="h-11"
            onClick={() => {
              void load(offset + PAGE_SIZE, false);
            }}
          >
            Load more history
          </Button>
        </div>
      ) : null}
    </div>
  );
}
