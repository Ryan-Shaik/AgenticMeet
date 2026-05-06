'use client';

import { useEffect, useState } from 'react';

type Payment = {
  userId: string;
  userName: string;
  userEmail: string;
  planName: string;
  status: string;
  price: string;
  currentPeriodEnd: string | null;
  stripeSubscriptionId: string | null;
};

type PaymentsResponse = {
  payments: Payment[];
  total: number;
  page: number;
};

const pageSize = 20;
const statuses = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'past_due', label: 'Past Due' },
  { value: 'canceled', label: 'Canceled' },
  { value: 'inactive', label: 'Inactive' },
];

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-500/20 text-emerald-400',
  past_due: 'bg-yellow-500/20 text-yellow-400',
  canceled: 'bg-red-500/20 text-red-400',
  inactive: 'bg-white/10 text-white/50',
};

function formatCurrency(price: string) {
  const amount = Number.parseFloat(price || '0');
  return `$${Number.isFinite(amount) ? amount.toFixed(2) : '0.00'}`;
}

function formatDate(value: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function PaymentStatusTable() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadPayments() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/admin/billing/payments?page=${page}&limit=${pageSize}&status=${encodeURIComponent(status)}`
        );
        if (!res.ok) {
          if (!cancelled) {
            setPayments([]);
            setTotal(0);
          }
          return;
        }
        const data = await res.json() as PaymentsResponse;
        if (!cancelled) {
          setPayments(data.payments);
          setTotal(data.total);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPayments();

    return () => {
      cancelled = true;
    };
  }, [page, status]);

  const hasNext = page * pageSize < total;

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-white font-bold text-lg">Payment Status</h2>
        <select
          value={status}
          onChange={event => {
            setStatus(event.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-lg bg-black/40 border border-white/10 text-sm text-white outline-none transition-colors hover:bg-white/10"
        >
          {statuses.map(option => (
            <option key={option.value} value={option.value} className="bg-black text-white">
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-white/50">
              <th className="pb-3 font-semibold">Name</th>
              <th className="pb-3 font-semibold">Email</th>
              <th className="pb-3 font-semibold">Plan</th>
              <th className="pb-3 font-semibold">Status</th>
              <th className="pb-3 font-semibold">Amount</th>
              <th className="pb-3 font-semibold">Renewal Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }, (_, index) => (
                <tr key={index} className="border-b border-white/5">
                  {Array.from({ length: 6 }, (_, cellIndex) => (
                    <td key={cellIndex} className="py-4">
                      <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
                    </td>
                  ))}
                </tr>
              ))
            ) : payments.length > 0 ? (
              payments.map(payment => (
                <tr
                  key={`${payment.userId}-${payment.stripeSubscriptionId ?? payment.planName}`}
                  className="border-b border-white/5 text-sm text-white/70 hover:bg-white/5"
                >
                  <td className="py-4 pr-4 text-white">{payment.userName}</td>
                  <td className="py-4 pr-4">{payment.userEmail}</td>
                  <td className="py-4 pr-4">{payment.planName}</td>
                  <td className="py-4 pr-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[payment.status] ?? statusStyles.inactive}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="py-4 pr-4">{formatCurrency(payment.price)}</td>
                  <td className="py-4">{formatDate(payment.currentPeriodEnd)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-white/50">
                  No payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex items-center justify-between text-sm text-white/50">
        <span>
          Page {page} of {Math.max(Math.ceil(total / pageSize), 1)}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage(current => Math.max(current - 1, 1))}
            disabled={page === 1 || loading}
            className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-white/20 transition-colors"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => setPage(current => current + 1)}
            disabled={!hasNext || loading}
            className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/10 text-white disabled:cursor-not-allowed disabled:opacity-40 hover:bg-white/20 transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
