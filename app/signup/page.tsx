"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Button } from "../../components/ui/button";

export default function SignUp() {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-obsidian-black font-sans">
      {/* Left side (Marketing) - hidden on mobile, visible lg */}
      <div className="hidden lg:flex w-full lg:w-[45%] relative bg-obsidian-black flex-col justify-between p-12 overflow-hidden border-r border-white/5">
        {/* Background Neural Network glows */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-electric-blue/20 rounded-full blur-[130px] -translate-y-1/4 translate-x-1/4 mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-neon-violet/20 rounded-full blur-[130px] translate-y-1/4 -translate-x-1/4 mix-blend-screen pointer-events-none" />
        {/* Mock Neural Network Grid layer */}
        <div className="absolute inset-0 bg-grid opacity-30 mask-image:linear-gradient(to_bottom,white,transparent) pointer-events-none" />
        
        <Link href="/" className="relative z-10 flex items-center gap-3 cursor-pointer w-max">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-electric-blue to-aurora-teal flex items-center justify-center font-bold text-lg text-chalk-white shadow-[0_0_15px_rgba(0,240,255,0.4)]">
            A
          </div>
          <span className="font-bold text-xl tracking-tight text-white hover:text-aurora-teal transition-colors">AgenticMeet</span>
        </Link>

        <div className="relative z-10 space-y-8 max-w-md">
          <h1 className="text-4xl lg:text-5xl font-serif font-bold tracking-tight text-white leading-tight">
            Join the future of collaboration.
          </h1>
          <div className="space-y-5">
            <div className="flex items-center gap-4 text-white/90">
              <div className="min-w-6 w-6 h-6 rounded-full bg-electric-blue/20 flex items-center justify-center border border-electric-blue/40 shadow-[0_0_10px_rgba(0,86,212,0.5)]">
                <CheckCircle2 size={12} className="text-electric-blue" />
              </div>
              <span className="text-lg">Access Agentic AI in your first meeting</span>
            </div>
            <div className="flex items-center gap-4 text-white/90">
              <div className="min-w-6 w-6 h-6 rounded-full bg-electric-blue/20 flex items-center justify-center border border-electric-blue/40 shadow-[0_0_10px_rgba(0,86,212,0.5)]">
                <CheckCircle2 size={12} className="text-electric-blue" />
              </div>
              <span className="text-lg">Unlock automated meeting intelligence</span>
            </div>
          </div>
        </div>

        {/* Decorative Quote */}
        <div className="relative z-10 p-6 glass-card rounded-2xl border border-white/10 text-white/70 text-sm italic backdrop-blur-md">
          &quot;The AI participant completely changed how we run our weekly syncs. Decisions are tracked instantly, and follow-ups are automated. Magic.&quot;
        </div>
      </div>

      {/* Right side (Form) */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 md:p-12 bg-white relative">
        <div className="w-full max-w-sm bg-white relative z-10">
          <div className="text-center mb-8">
            {/* Mobile-only logo */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-6">
               <div className="w-8 h-8 rounded-lg bg-electric-blue flex items-center justify-center font-bold text-lg text-white">
                 A
               </div>
               <span className="font-bold text-xl tracking-tight text-obsidian-black">AgenticMeet</span>
            </div>
            <h2 className="text-3xl font-bold text-obsidian-black tracking-tight mb-2">Create account</h2>
            <p className="text-obsidian-black/60 text-sm">Sign up to get started with AgenticMeet.</p>
          </div>

          <div className="space-y-3 mb-8">
            <Button variant="social-white" className="w-full">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continue with Google
            </Button>
            <Button variant="social-white" className="w-full">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              Continue with GitHub
            </Button>
          </div>

          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-black/10"></div>
            <span className="text-xs text-obsidian-black/40 font-medium">or register with email</span>
            <div className="flex-1 h-px bg-black/10"></div>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-obsidian-black mb-1.5">Full Name</label>
              <input 
                type="text" 
                placeholder="Eleanor Shellstrop" 
                className="w-full px-3 py-2.5 rounded-lg border border-black/20 bg-white text-obsidian-black placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-obsidian-black mb-1.5">Work Email</label>
              <input 
                type="email" 
                placeholder="name@company.com" 
                className="w-full px-3 py-2.5 rounded-lg border border-black/20 bg-white text-obsidian-black placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-obsidian-black mb-1.5">Create Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                className="w-full px-3 py-2.5 rounded-lg border border-black/20 bg-white text-obsidian-black placeholder:text-black/30 focus:outline-none focus:ring-2 focus:ring-electric-blue focus:border-transparent transition-all text-sm mb-3"
              />
              <div className="flex items-center gap-2">
                <div className="w-1/3 h-1 bg-aurora-teal rounded-full"></div>
                <div className="w-1/3 h-1 bg-aurora-teal rounded-full"></div>
                <div className="w-1/3 h-1 bg-black/10 rounded-full"></div>
                <span className="text-[10px] font-medium text-aurora-teal ml-1">Strong</span>
              </div>
            </div>

            <Button variant="primary" className="w-full mt-6">
              Start 14-Day Free Trial
            </Button>
          </form>

          <p className="text-center text-sm text-obsidian-black/60 mt-8">
            Already have an account? <Link href="/" className="font-medium text-electric-blue hover:underline">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
