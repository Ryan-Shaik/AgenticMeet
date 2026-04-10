import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function CancellationComplete() {
  return (
    <div className="min-h-screen bg-obsidian-black text-chalk-white font-sans flex items-center justify-center">
      <div className="text-center max-w-md p-8">
        <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 size={40} className="text-red-400" />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Subscription Canceled</h1>
        <p className="text-white/60 mb-8">
          Your subscription has been successfully canceled. You will have access until the end of your billing period.
        </p>
        
        <Link 
          href="/dashboard"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-electric-blue text-obsidian-black font-bold hover:bg-aurora-teal transition-colors"
        >
          <ArrowLeft size={20} />
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}