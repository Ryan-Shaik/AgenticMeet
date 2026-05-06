'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, BarChart2, TrendingUp, Users } from 'lucide-react';

type StatusCount = {
  status: string;
  count: number;
};

type OverviewData = {
  mrr: number;
  statusCounts: StatusCount[];
  planBreakdown: {
    planName: string;
    count: number;
  }[];
};

export function BillingOverviewCards() {
  const [data, setData] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadOverview() {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/billing/overview');
        if (!res.ok) return;
        const overview = await res.json() as OverviewData;
        if (!cancelled) setData(overview);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOverview();

    return () => {
      cancelled = true;
    };
  }, []);

  const active = data?.statusCounts.find(item => item.status === 'active')?.count ?? 0;
  const pastDue = data?.statusCounts.find(item => item.status === 'past_due')?.count ?? 0;
  const canceled = data?.statusCounts.find(item => item.status === 'canceled')?.count ?? 0;
  const total = data?.statusCounts.reduce((sum, item) => sum + Number(item.count), 0) ?? 0;
  const churnRate = total > 0 ? ((canceled / total) * 100).toFixed(1) : '0.0';
  const loadingValue = '—';

  const cards = [
    {
      label: 'Monthly Recurring Revenue',
      value: `$${(data?.mrr ?? 0).toFixed(2)}`,
      icon: TrendingUp,
      color: 'text-emerald-400',
    },
    {
      label: 'Active Subscriptions',
      value: String(active),
      icon: Users,
      color: 'text-blue-400',
    },
    {
      label: 'Past Due',
      value: String(pastDue),
      icon: AlertTriangle,
      color: 'text-yellow-400',
    },
    {
      label: 'Churn Rate',
      value: `${churnRate}%`,
      icon: BarChart2,
      color: 'text-red-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map(card => {
        const Icon = card.icon;

        return (
          <div key={card.label} className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <Icon size={20} className={card.color} />
              <span className="text-white/50 text-sm">{card.label}</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {loading ? loadingValue : card.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
