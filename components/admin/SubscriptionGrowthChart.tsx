'use client';

import { useEffect, useState } from 'react';

type GrowthPoint = {
  month: string;
  newSubscriptions: number;
};

const monthOptions = [3, 6, 12];

export function SubscriptionGrowthChart() {
  const [months, setMonths] = useState(6);
  const [data, setData] = useState<GrowthPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadGrowth() {
      setLoading(true);
      try {
        const res = await fetch(`/api/admin/billing/growth?months=${months}`);
        if (!res.ok) {
          if (!cancelled) setData([]);
          return;
        }
        const growth = await res.json() as GrowthPoint[];
        if (!cancelled) setData(growth);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadGrowth();

    return () => {
      cancelled = true;
    };
  }, [months]);

  const chartData = data.length > 0
    ? data
    : Array.from({ length: months }, (_, index) => ({
      month: `M${index + 1}`,
      newSubscriptions: 0,
    }));
  const maxValue = Math.max(...chartData.map(point => point.newSubscriptions), 1);
  const slotWidth = 600 / chartData.length;
  const barWidth = Math.min(34, slotWidth * 0.5);
  const baseline = 205;
  const maxBarHeight = 150;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-white font-bold text-lg">Subscription Growth</h2>
        <div className="flex items-center gap-2">
          {monthOptions.map(option => (
            <button
              key={option}
              type="button"
              onClick={() => setMonths(option)}
              className={`px-3 py-1.5 rounded-lg border text-sm transition-colors ${
                months === option
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {option}M
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <svg
          viewBox="0 0 600 250"
          role="img"
          aria-label={`New subscriptions over the last ${months} months`}
          className="min-w-[600px] w-full"
        >
          <line x1="24" y1={baseline} x2="580" y2={baseline} stroke="rgba(255,255,255,0.16)" />
          {[0, 1, 2].map(index => {
            const y = baseline - ((index + 1) * maxBarHeight) / 3;
            return (
              <line
                key={index}
                x1="24"
                y1={y}
                x2="580"
                y2={y}
                stroke="rgba(255,255,255,0.08)"
                strokeDasharray="4 6"
              />
            );
          })}

          {chartData.map((point, index) => {
            const height = loading ? 0 : (point.newSubscriptions / maxValue) * maxBarHeight;
            const x = index * slotWidth + slotWidth / 2 - barWidth / 2;
            const y = baseline - height;

            return (
              <g key={point.month}>
                <text
                  x={index * slotWidth + slotWidth / 2}
                  y={Math.max(20, y - 8)}
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.72)"
                  fontSize="12"
                  fontWeight="700"
                >
                  {loading ? '—' : point.newSubscriptions}
                </text>
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={height}
                  rx="4"
                  fill="#10b981"
                />
                <text
                  x={index * slotWidth + slotWidth / 2}
                  y="232"
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.5)"
                  fontSize="11"
                  fontWeight="600"
                >
                  {point.month}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}
