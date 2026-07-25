export type ProductPriceSnapshot = {
  costPrice: number;
  sellingPrice: number;
};

export type PriceHistoryRecord = {
  productId: string;
  oldCostPrice: number;
  newCostPrice: number;
  oldSellingPrice: number;
  newSellingPrice: number;
};

export type PriceHistoryRange = "7d" | "30d" | "90d" | "all";

export type CatalogProductLike = {
  id: string;
  name: string;
  costPrice: number;
  sellingPrice: number;
  updatedAt: string;
};

export type PriceHistoryLike = {
  id: string;
  changedAt: string;
  oldCostPrice: number;
  newCostPrice: number;
  oldSellingPrice: number;
  newSellingPrice: number;
};

export const LOW_MARKUP_THRESHOLD_PERCENT = 10;
export const RECENTLY_UPDATED_DAYS = 7;
export const DEFAULT_PRODUCT_PAGE_SIZE = 10;

export const hasPriceChange = (
  previous: ProductPriceSnapshot,
  next: ProductPriceSnapshot,
) =>
  previous.costPrice !== next.costPrice ||
  previous.sellingPrice !== next.sellingPrice;

export const buildPriceHistoryRecord = (
  productId: string,
  prices: {
    previous: ProductPriceSnapshot;
    next: ProductPriceSnapshot;
  },
): PriceHistoryRecord | null => {
  if (!hasPriceChange(prices.previous, prices.next)) {
    return null;
  }

  return {
    productId,
    oldCostPrice: prices.previous.costPrice,
    newCostPrice: prices.next.costPrice,
    oldSellingPrice: prices.previous.sellingPrice,
    newSellingPrice: prices.next.sellingPrice,
  };
};

/** Absolute profit per unit (selling − cost). */
export const computeMarkupAmount = (
  costPrice: number,
  sellingPrice: number,
): number => sellingPrice - costPrice;

/**
 * Markup percent relative to cost.
 * Returns null when cost is not positive so callers can show an honest empty state.
 */
export const computeMarkupPercent = (
  costPrice: number,
  sellingPrice: number,
): number | null => {
  if (!(costPrice > 0) || !Number.isFinite(costPrice) || !Number.isFinite(sellingPrice)) {
    return null;
  }

  return (computeMarkupAmount(costPrice, sellingPrice) / costPrice) * 100;
};

export const isLowMarkup = (
  percent: number | null,
  threshold: number = LOW_MARKUP_THRESHOLD_PERCENT,
): boolean => percent !== null && percent < threshold;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const rangeToMs = (range: PriceHistoryRange): number | null => {
  switch (range) {
    case "7d":
      return 7 * MS_PER_DAY;
    case "30d":
      return 30 * MS_PER_DAY;
    case "90d":
      return 90 * MS_PER_DAY;
    case "all":
      return null;
    default: {
      const _exhaustive: never = range;
      return _exhaustive;
    }
  }
};

export const summarizeProductCatalog = (
  products: CatalogProductLike[],
  now: Date = new Date(),
) => {
  const recentCutoff = now.getTime() - RECENTLY_UPDATED_DAYS * MS_PER_DAY;
  let recentlyUpdated = 0;
  let lowMarkupCount = 0;
  let highestMarkup: {
    productId: string;
    name: string;
    percent: number;
  } | null = null;

  for (const product of products) {
    const updatedAt = Date.parse(product.updatedAt);
    if (Number.isFinite(updatedAt) && updatedAt >= recentCutoff) {
      recentlyUpdated += 1;
    }

    const percent = computeMarkupPercent(product.costPrice, product.sellingPrice);
    if (isLowMarkup(percent)) {
      lowMarkupCount += 1;
    }

    if (percent !== null) {
      if (!highestMarkup || percent > highestMarkup.percent) {
        highestMarkup = {
          productId: product.id,
          name: product.name,
          percent,
        };
      }
    }
  }

  return {
    total: products.length,
    recentlyUpdated,
    highestMarkup,
    lowMarkupCount,
  };
};

export const filterProducts = <T extends CatalogProductLike>(
  products: T[],
  options: {
    search?: string;
    lowMarkupOnly?: boolean;
  } = {},
): T[] => {
  const query = options.search?.trim().toLowerCase() ?? "";

  return products.filter((product) => {
    if (query && !product.name.toLowerCase().includes(query)) {
      return false;
    }

    if (options.lowMarkupOnly) {
      const percent = computeMarkupPercent(product.costPrice, product.sellingPrice);
      if (!isLowMarkup(percent)) {
        return false;
      }
    }

    return true;
  });
};

export const paginateItems = <T>(
  items: T[],
  page: number,
  pageSize: number = DEFAULT_PRODUCT_PAGE_SIZE,
): {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
} => {
  const safePageSize = Math.max(1, Math.floor(pageSize));
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const safePage = Math.min(Math.max(1, Math.floor(page)), totalPages);
  const start = (safePage - 1) * safePageSize;

  return {
    items: items.slice(start, start + safePageSize),
    page: safePage,
    pageSize: safePageSize,
    total,
    totalPages,
  };
};

export const filterPriceHistoryByRange = <T extends { changedAt: string }>(
  items: T[],
  range: PriceHistoryRange,
  now: Date = new Date(),
): T[] => {
  const windowMs = rangeToMs(range);
  if (windowMs === null) {
    return [...items];
  }

  const cutoff = now.getTime() - windowMs;
  return items.filter((item) => {
    const changedAt = Date.parse(item.changedAt);
    return Number.isFinite(changedAt) && changedAt >= cutoff;
  });
};

export const summarizePriceHistory = (
  items: PriceHistoryLike[],
  currentProduct?: ProductPriceSnapshot,
) => {
  const totalChanges = items.length;
  const latestUpdate =
    items.reduce<string | null>((latest, item) => {
      if (!latest) {
        return item.changedAt;
      }
      return Date.parse(item.changedAt) > Date.parse(latest)
        ? item.changedAt
        : latest;
    }, null) ?? null;

  const markupSamples: number[] = [];

  for (const item of items) {
    const percent = computeMarkupPercent(item.newCostPrice, item.newSellingPrice);
    if (percent !== null) {
      markupSamples.push(percent);
    }
  }

  if (currentProduct) {
    const current = computeMarkupPercent(
      currentProduct.costPrice,
      currentProduct.sellingPrice,
    );
    if (current !== null && markupSamples.length === 0) {
      markupSamples.push(current);
    }
  }

  const averageMarkup =
    markupSamples.length > 0
      ? markupSamples.reduce((sum, value) => sum + value, 0) / markupSamples.length
      : null;

  return {
    totalChanges,
    latestUpdate,
    averageMarkup,
  };
};

export type PriceTrendPoint = {
  at: string;
  costPrice: number;
  sellingPrice: number;
};

/**
 * Build chronological (ascending) cost/selling series from history rows
 * (which are typically newest-first from the API).
 */
export const buildPriceTrendSeries = (
  items: PriceHistoryLike[],
  current?: ProductPriceSnapshot & { updatedAt?: string },
): PriceTrendPoint[] => {
  const chronological = [...items].sort(
    (a, b) => Date.parse(a.changedAt) - Date.parse(b.changedAt),
  );

  const points: PriceTrendPoint[] = [];

  if (chronological.length > 0) {
    const first = chronological[0];
    points.push({
      at: first.changedAt,
      costPrice: first.oldCostPrice,
      sellingPrice: first.oldSellingPrice,
    });

    for (const item of chronological) {
      points.push({
        at: item.changedAt,
        costPrice: item.newCostPrice,
        sellingPrice: item.newSellingPrice,
      });
    }
  }

  if (current) {
    const at = current.updatedAt ?? new Date().toISOString();
    const last = points[points.length - 1];
    if (
      !last ||
      last.costPrice !== current.costPrice ||
      last.sellingPrice !== current.sellingPrice
    ) {
      points.push({
        at,
        costPrice: current.costPrice,
        sellingPrice: current.sellingPrice,
      });
    }
  }

  return points;
};

export const parsePriceHistoryRange = (
  value: string | null | undefined,
): PriceHistoryRange | null => {
  if (value == null || value === "") {
    return "all";
  }

  if (value === "7d" || value === "30d" || value === "90d" || value === "all") {
    return value;
  }

  return null;
};

export const parseHistoryPagination = (input: {
  limit?: string | null;
  offset?: string | null;
}):
  | { ok: true; limit: number; offset: number }
  | { ok: false; message: string } => {
  const DEFAULT_LIMIT = 50;
  const MAX_LIMIT = 100;

  const rawLimit = input.limit ?? String(DEFAULT_LIMIT);
  const rawOffset = input.offset ?? "0";

  const limit = Number(rawLimit);
  const offset = Number(rawOffset);

  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_LIMIT) {
    return {
      ok: false,
      message: `Limit must be an integer between 1 and ${MAX_LIMIT}.`,
    };
  }

  if (!Number.isInteger(offset) || offset < 0) {
    return {
      ok: false,
      message: "Offset must be a non-negative integer.",
    };
  }

  return { ok: true, limit, offset };
};
