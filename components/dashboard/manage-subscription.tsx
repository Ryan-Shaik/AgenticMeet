'use client';

import { useState } from 'react';
import { Settings, X } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
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

  const handleCancel = async () => {
    if (!session?.user) return;
    if (!confirm('Are you sure you want to cancel your subscription?')) return;
    
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id, action: 'cancel' }),
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.error('Failed to cancel:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-white/70 text-xs font-bold uppercase tracking-widest hover:bg-white/20 transition-colors"
      >
        <Settings size={12} />
        {loading ? 'Loading...' : 'Manage'}
      </button>
      
      {showMenu && (
        <div className="absolute right-0 mt-2 w-48 bg-obsidian-black border border-white/20 rounded-lg shadow-xl z-50">
          <button
            onClick={() => { setShowMenu(false); handleManage(); }}
            disabled={loading}
            className="w-full px-4 py-2 text-left text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors flex items-center gap-2"
          >
            <Settings size={14} />
            Manage Subscription
          </button>
          <button
            onClick={() => { setShowMenu(false); handleCancel(); }}
            disabled={loading}
            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
          >
            <X size={14} />
            Cancel Subscription
          </button>
        </div>
      )}
    </div>
  );
}