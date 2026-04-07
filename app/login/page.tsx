"use client";

import { LoginButtons } from "@/components/auth/login-button";
import { authClient } from "@/lib/auth-client";
import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const Login = () => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isPending && session) {
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  return (
    <div className="min-h-screen bg-obsidian-black flex flex-col items-center justify-center font-sans relative overflow-hidden">
      {/* Subtle slow-moving violet light trails */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
         <div className="absolute top-[20%] -left-[10%] w-[40vw] h-[40vw] bg-neon-violet/10 rounded-full blur-[120px] animate-[pulseNeon_8s_ease-in-out_infinite]" />
         <div className="absolute bottom-[20%] -right-[10%] w-[50vw] h-[50vw] bg-neon-violet/[0.07] rounded-full blur-[150px] animate-[pulseNeon_12s_ease-in-out_infinite_reverse]" />
      </div>

      <div className="w-full max-w-md p-6 relative z-10 flex flex-col items-center animation-fade-in transition-opacity duration-1000" style={{ opacity: mounted ? 1 : 0 }}>
        {/* Floating authentication module */}
        <div className="w-full glass rounded-[2rem] p-8 md:p-10 border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] bg-black/40 backdrop-blur-2xl relative overflow-hidden">
          
          {/* AI Guard Indicator */}
          <div className="absolute top-0 left-0 right-0 py-2 bg-gradient-to-r from-transparent via-neon-violet/20 to-transparent flex items-center justify-center gap-2 border-b border-neon-violet/20">
            <ShieldCheck size={12} className="text-neon-violet animate-pulse" />
            <span className="text-[10px] uppercase tracking-widest text-neon-violet font-bold">AI Guard Securing Session...</span>
          </div>

          <div className="flex flex-col items-center mb-10 mt-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-electric-blue to-aurora-teal flex items-center justify-center font-bold text-2xl text-chalk-white shadow-[0_0_20px_rgba(0,240,255,0.4)] mb-4">
              A
            </div>
            <span className="font-bold text-2xl tracking-tight text-white mb-1">AgenticMeet</span>
            <p className="text-white/50 text-sm font-medium">Welcome back, secure access granted.</p>
          </div>



          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-xs text-white/40 font-bold uppercase tracking-widest">Or continue with</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-2 uppercase tracking-wider">Work Email</label>
              <input 
                type="email" 
                placeholder="name@company.com" 
                className="w-full px-4 py-3.5 rounded-xl border border-aurora-teal/30 bg-white/[0.03] text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-aurora-teal focus:border-aurora-teal transition-all text-sm font-medium shadow-[0_0_15px_rgba(0,240,255,0.03)_inset]"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                 <label className="block text-xs font-semibold text-white/70 uppercase tracking-wider">Password</label>
                 <Link href="#" className="text-xs font-medium text-electric-blue hover:text-aurora-teal transition-colors">Forgot Password?</Link>
              </div>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full px-4 py-3.5 rounded-xl border border-aurora-teal/30 bg-white/[0.03] text-white placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-aurora-teal focus:border-aurora-teal transition-all text-sm font-medium shadow-[0_0_15px_rgba(0,240,255,0.03)_inset]"
              />
            </div>

             <LoginButtons/>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5">
             <p className="text-center text-sm text-white/50 font-medium">
               Don't have an account? <Link href="/signup" className="text-white font-bold hover:text-neon-violet transition-colors">Sign Up</Link>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
