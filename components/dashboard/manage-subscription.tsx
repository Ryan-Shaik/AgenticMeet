'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);
  const { data: session } = authClient.useSession();

  const handleManage = async () => {
    if (!session?.user) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Failed to open portal:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleManage}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/70 text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition-colors"
    >
      <Settings size={12} />
      {loading ? 'Loading...' : 'Manage'}
    </button>
  );
}