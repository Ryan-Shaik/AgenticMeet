import { Play, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "../components/ui/button";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import Image from "next/image";

const Home = async () => {
  const session = await getSession();
  if (session) {
    return redirect("/dashboard");
  }
  return (
    <div className="min-h-screen bg-obsidian-black text-chalk-white font-sans bg-grid relative flex flex-col overflow-x-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-electric-blue/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-neon-violet/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <nav className="max-w-7xl mx-auto glass rounded-2xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-[0_0_15px_rgba(0,240,255,0.4)]">
              <Image src="/logo.png" alt="AgenticMeet" width={32} height={32} className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-xl tracking-tight">AgenticMeet</span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-chalk-white/80">
            <a href="#features" className="hover:text-aurora-teal transition-colors">Features</a>
            <Link href="/pricing" className="hover:text-aurora-teal transition-colors">Pricing</Link>
            <a href="#enterprise" className="hover:text-aurora-teal transition-colors">Enterprise</a>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden md:block text-sm font-medium hover:text-aurora-teal transition-colors">
              Log In
            </Link>
            <Link href="/signup" className="px-5 py-2.5 rounded-xl bg-electric-blue text-sm font-bold shadow-[0_0_20px_rgba(0,86,212,0.6)] hover:shadow-[0_0_30px_rgba(0,240,255,0.8)] hover:bg-aurora-teal hover:text-obsidian-black transition-all flex items-center justify-center">
              Get Started Free
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center pt-32 pb-20 px-6 z-10 w-full">
        
        {/* Hero Content */}
        <div className="max-w-4xl mx-auto text-center mt-12 mb-16 px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-aurora-teal/30 bg-aurora-teal/10 text-aurora-teal text-xs font-semibold mb-6 uppercase tracking-wider">
            <Sparkles size={14} />
            The Future of Video Conferencing
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold tracking-tight mb-6 leading-[1.1]">
            Meet Your Most <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-aurora-teal to-electric-blue">
              Intelligent Team Member.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-chalk-white/70 max-w-2xl mx-auto leading-relaxed mb-10">
            AgenticMeet integrates an active AI participant into your video conferences for real-time intelligence, automated notes, and seamless communication.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-chalk-white text-obsidian-black text-base font-bold shadow-[0_0_20px_rgba(250,250,250,0.3)] hover:scale-105 transition-transform flex items-center justify-center">
              Start Your Free Trial
            </Link>
            <Button variant="glass" size="lg" className="w-full sm:w-auto">
              <Play fill="currentColor" size={16} />
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Hero Visual: Video Call Preveiw */}
        <div className="w-full max-w-5xl mx-auto glass-card rounded-3xl p-4 md:p-6 mb-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6">
            {/* Person 1 */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700">
              <Image src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800" alt="Person 1" fill className="object-cover" />
              <div className="absolute bottom-3 left-3 px-3 py-1 bg-obsidian-black/60 rounded-md text-xs font-medium backdrop-blur-md">
                Sarah Jenkins
              </div>
            </div>
            {/* Person 2 */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700 mx-auto w-full">
              <Image src="https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=800" alt="Person 2" fill className="object-cover" />
              <div className="absolute bottom-3 left-3 px-3 py-1 bg-obsidian-black/60 rounded-md text-xs font-medium backdrop-blur-md">
                Michael Chen
              </div>
              <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-aurora-teal shadow-[0_0_8px_#00F0FF] animate-pulse" />
            </div>
            {/* Person 3 */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-800 border border-zinc-700">
              <Image src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800" alt="Person 3" fill className="object-cover" />
              <div className="absolute bottom-3 left-3 px-3 py-1 bg-obsidian-black/60 rounded-md text-xs font-medium backdrop-blur-md">
                Elena Rodriguez
              </div>
            </div>
            {/* The AI Participant */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 border border-neon-violet/30 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-neon-violet/10 to-transparent" />
              <div className="w-24 h-24 rounded-full bg-neon-violet/20 animate-pulse-neon flex items-center justify-center relative">
                 <div className="w-20 h-20 rounded-full bg-obsidian-black border border-neon-violet/50 shadow-[0_0_15px_rgba(176,38,255,0.4)] flex items-center justify-center z-10">
                    <span className="text-neon-violet font-bold text-3xl font-serif">A</span>
                 </div>
              </div>
              <div className="absolute bottom-3 left-3 px-3 py-1 bg-neon-violet/20 border border-neon-violet/40 text-neon-violet rounded-md text-xs font-medium backdrop-blur-md flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-neon-violet animate-pulse shadow-[0_0_5px_#B026FF]" />
                Agentic AI (Active)
              </div>
            </div>
          </div>

          {/* Live Transcription Box */}
          <div className="h-32 md:h-24 bg-obsidian-black/80 rounded-xl border border-aurora-teal/20 p-4 md:px-6 md:py-4 overflow-hidden relative">
             <div className="absolute left-4 md:left-6 top-4 text-[10px] md:text-xs font-bold text-aurora-teal/70 uppercase tracking-widest bg-obsidian-black/90 pr-2 z-10">
               Live Transcript
             </div>
             <div className="mt-6 md:mt-4 h-full overflow-hidden relative opacity-90">
                <div className="animate-scroll flex flex-col gap-3 text-sm md:text-base text-aurora-teal/90">
                  <p><span className="font-semibold text-chalk-white">Michael:</span> Let&apos;s review the deployment schedule for V2.</p>
                  <p><span className="font-semibold text-chalk-white">Elena:</span> I&apos;m ready. The backend is fully scalable now.</p>
                  <p><span className="font-semibold text-chalk-white">Sarah:</span> Can someone take notes on the action items?</p>
                  <p><span className="font-semibold text-neon-violet">Agentic AI:</span> I will automatically extract all action items and decisions made during this discussion and generate a structured summary.</p>
                  <p><span className="font-semibold text-chalk-white">Michael:</span> Excellent. Let&apos;s move on to the marketing side.</p>
                  
                  {/* Duplicated for smooth infinite scroll */}
                  <p><span className="font-semibold text-chalk-white">Michael:</span> Let&apos;s review the deployment schedule for V2.</p>
                  <p><span className="font-semibold text-chalk-white">Elena:</span> I&apos;m ready. The backend is fully scalable now.</p>
                  <p><span className="font-semibold text-chalk-white">Sarah:</span> Can someone take notes on the action items?</p>
                  <p><span className="font-semibold text-neon-violet">Agentic AI:</span> I will automatically extract all action items and decisions made during this discussion and generate a structured summary.</p>
                  <p><span className="font-semibold text-chalk-white">Michael:</span> Excellent. Let&apos;s move on to the marketing side.</p>
                </div>
             </div>
             {/* Gradient fade out at top and bottom */}
             <div className="absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-obsidian-black to-transparent z-1 pointer-events-none" />
             <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-obsidian-black to-transparent z-1 pointer-events-none" />
          </div>
        </div>

        {/* Proof Section */}
        <div className="flex flex-col items-center">
          <p className="text-sm font-medium text-chalk-white/50 mb-8 uppercase tracking-widest text-center">
            Trusted by forward-thinking teams
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500 pb-10">
             <div className="text-2xl font-bold font-serif">Acme Corp</div>
             <div className="text-2xl font-bold tracking-tight">GlobalTech</div>
             <div className="text-2xl font-black italic">NexGen</div>
             <div className="text-2xl font-medium tracking-widest">AETHER</div>
             <div className="text-2xl font-bold">Quantum</div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
