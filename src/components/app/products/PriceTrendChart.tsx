import type { PriceTrendPoint } from "@/lib/domain/pricing";

interface PriceTrendChartProps {
  points: PriceTrendPoint[];
  summaryText: string;
}

function buildPath(
  values: number[],
  width: number,
  height: number,
  min: number,
  max: number,
): string {
  if (values.length === 0) {
    return "";
  }

  const span = Math.max(max - min, 0.01);
  return values
    .map((value, index) => {
      const x =
        values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
      const y = height - ((value - min) / span) * height;
      return `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

export function PriceTrendChart({ points, summaryText }: PriceTrendChartProps) {
  const width = 640;
  const height = 180;
  const pad = 8;

  if (points.length === 0) {
    return (
      <div className="vn-card p-5">
        <h3 className="text-sm font-semibold text-ink font-heading">
          Price trend
        </h3>
        <p className="text-xs text-muted-text mt-2">
          No price changes yet. The trend appears after cost or selling price
          updates.
        </p>
      </div>
    );
  }

  const costs = points.map((point) => point.costPrice);
  const sellings = points.map((point) => point.sellingPrice);
  const min = Math.min(...costs, ...sellings);
  const max = Math.max(...costs, ...sellings);
  const costPath = buildPath(costs, width - pad * 2, height - pad * 2, min, max);
  const sellingPath = buildPath(
    sellings,
    width - pad * 2,
    height - pad * 2,
    min,
    max,
  );

  return (
    <div className="vn-card p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-ink font-heading">
          Price trend
        </h3>
        <div className="flex items-center gap-4 text-[11px] text-muted-text font-semibold">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-primary" aria-hidden="true" />
            Selling
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span
              className="h-2 w-2 rounded-full bg-emerald-600"
              aria-hidden="true"
            />
            Cost
          </span>
        </div>
      </div>

      <p id="price-trend-chart-summary" className="sr-only">
        {summaryText}
      </p>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-44"
        role="img"
        aria-labelledby="price-trend-chart-summary"
      >
        <g transform={`translate(${pad}, ${pad})`}>
          <path
            d={sellingPath}
            fill="none"
            stroke="currentColor"
            className="text-primary"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d={costPath}
            fill="none"
            stroke="currentColor"
            className="text-emerald-600"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
}
