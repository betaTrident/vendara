import type { BalanceTrendPoint } from "@/lib/domain/ledger";

interface BalanceChartProps {
  points: BalanceTrendPoint[];
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

export function BalanceChart({ points, summaryText }: BalanceChartProps) {
  const width = 640;
  const height = 180;
  const pad = 8;

  if (points.length === 0) {
    return (
      <div className="vn-card p-5">
        <h3 className="text-sm font-semibold text-ink font-heading">
          Balance over time
        </h3>
        <p className="text-xs text-muted-text mt-2">
          No balance history yet. The chart appears after the first active
          transaction.
        </p>
      </div>
    );
  }

  const balances = points.map((point) => point.balance);
  const min = Math.min(...balances, 0);
  const max = Math.max(...balances, 0);
  const path = buildPath(
    balances,
    width - pad * 2,
    height - pad * 2,
    min,
    max,
  );

  return (
    <div className="vn-card p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-ink font-heading">
          Balance over time
        </h3>
        <span className="text-[11px] text-muted-text font-semibold">
          Outstanding balance after each entry
        </span>
      </div>

      <p id="balance-chart-summary" className="sr-only">
        {summaryText}
      </p>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto text-primary"
        role="img"
        aria-labelledby="balance-chart-summary"
      >
        <g transform={`translate(${pad}, ${pad})`}>
          <path
            d={path}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>

      <div className="overflow-x-auto">
        <table className="w-full text-xs" aria-label="Balance trend data">
          <caption className="sr-only">
            Balance trend data table equivalent for screen readers
          </caption>
          <thead>
            <tr className="text-left text-muted-text">
              <th className="py-2 pr-4 font-semibold">Date</th>
              <th className="py-2 font-semibold">Balance</th>
            </tr>
          </thead>
          <tbody>
            {points.map((point) => (
              <tr key={`${point.at}-${point.balance}`} className="border-t border-hairline-soft">
                <td className="py-2 pr-4 font-mono text-muted-text">{point.at}</td>
                <td className="py-2 font-mono tabular-nums text-ink">
                  ₱{point.balance.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
