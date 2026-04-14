'use client';

import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Check, Zap, Crown, Building2 } from 'lucide-react';

export default function PricingPage() {
  const { data: session } = authClient.useSession();
  const router = useRouter();

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

  return (
    <div className="min-h-screen bg-obsidian-black text-chalk-white font-sans py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your <span className="text-aurora-teal">Plan</span>
          </h1>
          <p className="text-white/60 text-lg max-w-2xl mx-auto">
            Scale your meetings with AI-powered intelligence. Start free, upgrade anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl p-8 border transition-all duration-300 ${
                  plan.highlighted
                    ? 'bg-gradient-to-b from-electric-blue/20 to-obsidian-black border-electric-blue/50 shadow-[0_0_40px_rgba(0,86,212,0.2)]'
                    : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-electric-blue text-obsidian-black text-xs font-bold rounded-full">
                    MOST POPULAR
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-2 rounded-xl ${plan.highlighted ? 'bg-electric-blue/20 text-electric-blue' : 'bg-white/10 text-white/70'}`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                </div>

                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-white/50 ml-1">{plan.interval}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm">
                      <Check size={16} className="text-aurora-teal shrink-0" />
                      <span className="text-white/70">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => plan.id !== 'free' && handleSubscribe(plan.id)}
                  disabled={plan.id === 'free'}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${
                    plan.id === 'free'
                      ? 'bg-white/10 text-white/50 cursor-not-allowed'
                      : plan.highlighted
                      ? 'bg-electric-blue text-obsidian-black hover:bg-aurora-teal'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {plan.id === 'free' ? 'Current Plan' : 'Subscribe Now'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}