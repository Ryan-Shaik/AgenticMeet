'use client';

import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Check, Zap, Crown, Building2, Loader2, Home, Video, BarChart2, FileText, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ManageSubscriptionButton } from '@/components/dashboard/manage-subscription';
import { LogoutButton } from '@/components/auth/logout-button';

export default function PricingPage() {
  const { data: session } = authClient.useSession();
  const router = useRouter();
  const [currentPlanId, setCurrentPlanId] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  useEffect(() => {
    async function fetchSubscriptionStatus() {
      if (!session?.user?.id) {
        setLoadingStatus(false);
        return;
      }

      try {
        const res = await fetch('/api/subscription/status', {
          headers: {
            'x-user-id': session.user.id
          }
        });
        const data = await res.json();
        if (data.plan?.id) {
          setCurrentPlanId(data.plan.id);
        } else {
          setCurrentPlanId('free');
        }
      } catch (error) {
        console.error('Failed to fetch status:', error);
        setCurrentPlanId('free');
      } finally {
        setLoadingStatus(false);
      }
    }

    fetchSubscriptionStatus();
  }, [session]);

  const handleSubscribe = async (planId: string) => {
    if (!session?.user) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id, planId }),
      });

      const data = await res.json();

      if (data.url) {
        router.push(data.url);
      } else {
        console.error('Checkout error:', data.error);
      }
    } catch (error) {
      console.error('Failed to create checkout:', error);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      interval: 'forever',
      icon: Zap,
      features: [
        '5 meetings per month',
        '10 AI response minutes',
        'Basic transcription',
        'Email support',
      ],
      highlighted: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$19',
      interval: '/month',
      icon: Crown,
      features: [
        'Unlimited meetings',
        '60 AI response minutes',
        'Live transcription',
        'Meeting summaries',
        'Priority support',
      ],
      highlighted: true,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$99',
      interval: '/month',
      icon: Building2,
      features: [
        'Everything in Pro',
        'Unlimited AI minutes',
        'Team management',
        'Usage analytics',
        'Dedicated support',
        'Custom integrations',
      ],
      highlighted: false,
    },
  ];

  const planName = currentPlanId || 'free';

  return (
    <div className="min-h-screen bg-obsidian-black text-chalk-white font-sans flex overflow-hidden">
      
      {/* Left Navigation (Sidebar) */}
      <nav className="w-20 border-r border-white/5 bg-black/50 flex flex-col items-center py-6 gap-8 z-20 shrink-0">
        <Link href="/dashboard" className="w-10 h-10 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(0,240,255,0.4)] transition-transform hover:scale-110 duration-300">
          <Image src="/logo.png" alt="AgenticMeet" width={40} height={40} className="w-full h-full object-cover" />
        </Link>
        <div className="flex flex-col gap-6 flex-1 mt-4 text-white/50">
          <Link href="/dashboard" className="p-3 rounded-xl hover:bg-white/5 hover:text-white transition-colors" title="Dashboard">
            <Home size={22} />
          </Link>
          <a href="#" className="p-3 rounded-xl hover:bg-white/5 hover:text-white transition-colors" title="Meetings"><Video size={22} /></a>
          <a href="#" className="p-3 rounded-xl hover:bg-white/5 hover:text-white transition-colors" title="Analytics"><BarChart2 size={22} /></a>
          <a href="/transcripts" className="p-3 rounded-xl hover:bg-white/5 hover:text-white transition-colors" title="Transcripts"><FileText size={22} /></a>
        </div>
        <a href="#" className="p-3 rounded-xl hover:bg-white/5 text-white/50 hover:text-white transition-colors" title="Settings"><Settings size={22} /></a>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative bg-[#050505]">
        {/* Background Mesh */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-electric-blue/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-neon-violet/5 rounded-full blur-[150px] pointer-events-none" />

        {/* Top Header */}
        <header className="px-8 py-6 flex items-center justify-between border-b border-white/5 bg-obsidian-black/80 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Billing & Plans</h1>
            <p className="text-sm font-medium text-white/50 mt-1">Manage your subscription and usage limits.</p>
          </div>
          <div className="flex items-center gap-4">
            <ManageSubscriptionButton />
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(0,240,255,0.1)] ${planName === 'free' ? 'bg-white/10 border border-white/20 text-white/70' : planName === 'pro' ? 'bg-aurora-teal/10 border border-aurora-teal/30 text-aurora-teal' : 'bg-neon-violet/10 border border-neon-violet/30 text-neon-violet'}`}>
              <Zap size={12} className={planName === 'pro' ? 'fill-aurora-teal' : planName === 'enterprise' ? 'fill-neon-violet' : ''} /> {planName.charAt(0).toUpperCase() + planName.slice(1)} Plan
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <div className="text-sm font-bold">{session?.user?.name || "User"}</div>
                <div className="text-xs font-medium text-white/50 uppercase tracking-tighter">Member</div>
              </div>
              <Image src={session?.user?.image || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100"} alt="Avatar" width={40} height={40} className="w-10 h-10 rounded-full border-2 border-white/10" />
            </div>
            <LogoutButton />
          </div>
        </header>

        {/* Pricing Content */}
        <div className="p-8 pb-20 max-w-7xl mx-auto w-full z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Scale Your <span className="text-aurora-teal">Productivity</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Empower your meetings with AI intelligence. Upgrade to unlock powerful transcription and summarization features.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-stretch justify-center">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrentPlan = currentPlanId === plan.id;
              
              return (
                <div
                  key={plan.id}
                  className={`relative flex-1 min-w-0 rounded-3xl p-8 border transition-all duration-300 flex flex-col ${
                    plan.highlighted
                      ? 'bg-gradient-to-b from-electric-blue/20 to-obsidian-black border-electric-blue/50 shadow-[0_0_40px_rgba(0,86,212,0.2)]'
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-electric-blue text-obsidian-black text-xs font-bold rounded-full">
                      RECOMMENDED
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-6">
                    <div className={`p-2 rounded-xl ${plan.highlighted ? 'bg-electric-blue/20 text-electric-blue' : 'bg-white/10 text-white/70'}`}>
                      <Icon size={24} />
                    </div>
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                  </div>

                  <div className="mb-8">
                    <span className="text-5xl font-bold">{plan.price}</span>
                    <span className="text-white/50 ml-1 text-lg">{plan.interval}</span>
                  </div>

                  <ul className="space-y-4 mb-10 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-4 text-sm">
                        <div className="mt-1 w-5 h-5 rounded-full bg-aurora-teal/10 flex items-center justify-center shrink-0">
                          <Check size={12} className="text-aurora-teal" />
                        </div>
                        <span className="text-white/70 leading-snug">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => !isCurrentPlan && handleSubscribe(plan.id)}
                    disabled={isCurrentPlan || (loadingStatus && !!session?.user)}
                    className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                      isCurrentPlan
                        ? 'bg-white/10 text-white/50 cursor-not-allowed border border-white/10'
                        : plan.highlighted
                        ? 'bg-electric-blue text-obsidian-black hover:bg-aurora-teal shadow-[0_0_20px_rgba(0,86,212,0.4)]'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {loadingStatus && !!session?.user ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : isCurrentPlan ? (
                      'Active Protection'
                    ) : (
                      'Upgrade Now'
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}