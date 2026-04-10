import { 
  Home, Video, BarChart2, Lightbulb, Settings, 
  Plus, Calendar, Zap, CheckCircle2,
  Activity, Users, Mic, TrendingUp
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import Image from "next/image";
import Link from "next/link";

const Dashboard = async () => {
  const session = await getSession();
  if(!session) return redirect("/login");
  return (
    <div className="min-h-screen bg-obsidian-black text-chalk-white font-sans flex overflow-hidden">
      
      {/* Left Navigation */}
      <nav className="w-20 border-r border-white/5 bg-black/50 flex flex-col items-center py-6 gap-8 z-20 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-blue to-aurora-teal flex items-center justify-center font-bold text-xl text-white shadow-[0_0_15px_rgba(0,240,255,0.4)]">
          A
        </div>
        <div className="flex flex-col gap-6 flex-1 mt-4 text-white/50">
          <a href="#" className="p-3 rounded-xl bg-electric-blue/10 text-electric-blue hover:text-aurora-teal transition-colors relative group">
            <Home size={22} />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-electric-blue rounded-r-md"></div>
          </a>
          <a href="#" className="p-3 rounded-xl hover:bg-white/5 hover:text-white transition-colors" title="Meetings"><Video size={22} /></a>
          <a href="#" className="p-3 rounded-xl hover:bg-white/5 hover:text-white transition-colors" title="Analytics"><BarChart2 size={22} /></a>
          <a href="#" className="p-3 rounded-xl hover:bg-white/5 hover:text-white transition-colors" title="Workflow Automation"><Lightbulb size={22} /></a>
        </div>
        <a href="#" className="p-3 rounded-xl hover:bg-white/5 text-white/50 hover:text-white transition-colors" title="Settings"><Settings size={22} /></a>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        {/* Background Mesh */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-electric-blue/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-neon-violet/5 rounded-full blur-[150px] pointer-events-none" />

        {/* Top Header */}
        <header className="px-8 py-6 flex items-center justify-between border-b border-white/5 bg-obsidian-black/80 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Organization Hub</h1>
            <p className="text-sm font-medium text-white/50 mt-1">Welcome back, {session?.user?.name?.split(' ')[0] || "User"}. You have 3 meetings today.</p>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/pricing" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-aurora-teal/10 border border-aurora-teal/30 text-aurora-teal text-xs font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(0,240,255,0.1)] hover:bg-aurora-teal/20 transition-colors">
              <Zap size={12} className="fill-aurora-teal" /> Pro Plan
            </Link>
              <div className="flex items-center gap-3">
              <div className="text-right hidden md:block">
                <div className="text-sm font-bold">{session?.user?.name || "User"}</div>
                <div className="text-xs font-medium text-white/50">Director of Product</div>
              </div>
              <Image src={session?.user?.image || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=100"} alt="Avatar" width={40} height={40} className="w-10 h-10 rounded-full border-2 border-white/10" />
            </div>
            <LogoutButton />
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
          
          {/* Hero Widget (Left Top) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="glass-card rounded-3xl p-6 border border-white/5 relative overflow-hidden h-full">
              <div className="absolute top-0 right-0 w-32 h-32 bg-electric-blue/20 rounded-full blur-[50px] pointer-events-none" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-white font-bold text-lg">Upcoming Meetings</h2>
                  <Calendar size={18} className="text-white/50" />
                </div>
                
                <div className="space-y-4 mb-8 flex-1">
                  <div className="flex gap-4 items-start p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-electric-blue/30 transition-colors cursor-pointer">
                    <div className="w-12 h-12 rounded-xl bg-electric-blue/20 text-electric-blue flex flex-col items-center justify-center border border-electric-blue/30 leading-tight shrink-0">
                      <span className="text-[10px] font-bold uppercase">Oct</span>
                      <span className="text-lg font-black">12</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-sm mb-1 text-white leading-tight">V2 Deployment Review</h3>
                      <p className="text-xs text-white/50 mb-3 font-medium">10:00 AM - 11:30 AM</p>
                      <div className="flex -space-x-2">
                        <Image src="https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=100" alt="User" width={24} height={24} className="w-6 h-6 rounded-full border border-obsidian-black z-20" />
                        <Image src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=100" alt="User" width={24} height={24} className="w-6 h-6 rounded-full border border-obsidian-black z-10" />
                        <div className="w-6 h-6 rounded-full border border-obsidian-black bg-white/10 flex items-center justify-center text-[10px] font-bold text-white z-0">+2</div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button variant="neon" className="w-full">
                  <Plus size={18} /> Start Meeting with AI Agent
                </Button>
              </div>
            </div>
          </div>

          {/* AI Intelligence Feed (Center Top) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
             <div className="glass-card rounded-3xl p-6 border border-white/5 h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Zap size={18} className="text-aurora-teal" />
                    <h2 className="text-white font-bold text-lg">Agentic Insights Feed</h2>
                  </div>
                  <button className="text-xs font-semibold text-white/50 hover:text-white transition-colors">View All</button>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                  {/* Insight Card 1 */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 hover:border-aurora-teal/30 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-electric-blue"></div>
                      <span className="text-xs font-bold text-white/70">Project Apollo Sync</span>
                      <span className="text-[10px] uppercase font-bold text-white/30 ml-auto">2 hours ago</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex gap-3">
                        <CheckCircle2 size={16} className="text-aurora-teal shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-white/90 leading-tight">3 Action Items assigned to Sarah for backend refactor.</p>
                      </div>
                      <div className="flex gap-3">
                        <Activity size={16} className="text-neon-violet shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-white/90 leading-tight">Decisions Made: Q4 Budget Approved.</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 border border-white/5 text-[10px] font-bold text-white/60">
                        Sentiment <span className="text-aurora-teal">Positive ↑</span>
                      </div>
                    </div>
                  </div>

                  {/* Insight Card 2 */}
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 hover:border-aurora-teal/30 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-2 h-2 rounded-full bg-neon-violet"></div>
                      <span className="text-xs font-bold text-white/70">Marketing Standup</span>
                      <span className="text-[10px] uppercase font-bold text-white/30 ml-auto">5 hours ago</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex gap-3">
                        <CheckCircle2 size={16} className="text-aurora-teal shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-white/90 leading-tight">Michael leading campaign redesign.</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 border border-white/5 text-[10px] font-bold text-white/60">
                        Sentiment <span className="text-white/80">Neutral →</span>
                      </div>
                    </div>
                  </div>
                </div>
             </div>
          </div>

          {/* Live Meeting Activity (Right) */}
          <div className="lg:col-span-3 lg:row-span-2 flex flex-col gap-6">
             <div className="glass-card rounded-3xl p-6 border border-white/5 h-full relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 bg-neon-violet/10 rounded-full blur-[50px] pointer-events-none" />
                
                <h2 className="text-white font-bold text-lg mb-6 relative z-10">Live Activity</h2>
                
                <div className="space-y-4 flex-1 relative z-10">
                  {/* Active AI Meeting */}
                  <div className="p-4 rounded-2xl bg-obsidian-black border border-neon-violet/40 shadow-[0_0_20px_rgba(176,38,255,0.15)] relative group cursor-pointer hover:border-neon-violet/60 transition-all">
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5">
                       <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-violet opacity-75"></span>
                       <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-neon-violet"></span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-neon-violet/20 border border-neon-violet/30 text-[10px] font-bold text-neon-violet uppercase tracking-wider mb-4 shadow-[0_0_10px_rgba(176,38,255,0.2)]">
                      <Mic size={10} /> AI Active
                    </div>
                    <h3 className="font-bold text-sm mb-1 leading-tight text-white">Product Roadmap Sync</h3>
                    <p className="text-xs text-white/50 mb-4 flex items-center gap-1.5 font-medium">
                       <Users size={12} /> 4 Participants
                    </p>
                    <div className="flex items-center justify-between text-[11px] font-bold text-aurora-teal border-t border-white/10 pt-3 relative w-full pt-4">
                      {/* Pulse effect line */}
                      <div className="absolute top-0 left-0 h-px bg-gradient-to-r from-neon-violet to-transparent w-full"></div>
                      <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-aurora-teal animate-pulse"></div> Generating Notes...</span>
                      <span>42m</span>
                    </div>
                  </div>

                  {/* Regular Active Meeting */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/5 cursor-pointer hover:bg-white/10 transition-all">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 border border-white/10 text-[10px] font-bold text-white/70 uppercase tracking-wider mb-4">
                      Live
                    </div>
                    <h3 className="font-bold text-sm mb-1 leading-tight text-white">Engineering All-Hands</h3>
                    <p className="text-xs text-white/50 mb-4 flex items-center gap-1.5 font-medium">
                       <Users size={12} /> 12 Participants
                    </p>
                    <div className="flex items-center justify-between text-[11px] font-bold text-white/40 border-t border-white/5 pt-3">
                      <span>No AI Agent</span>
                      <span>1h 15m</span>
                    </div>
                  </div>
                </div>
             </div>
          </div>

          {/* Analytics Widget (Bottom spans 9 cols) */}
          <div className="lg:col-span-9 flex flex-col gap-6">
            <div className="glass-card rounded-3xl p-6 border border-white/5 flex flex-col min-h-[260px] relative overflow-hidden">
               <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 relative z-10 gap-4">
                  <div className="flex items-center gap-2">
                    <TrendingUp size={18} className="text-electric-blue" />
                    <h2 className="text-white font-bold text-lg">AI Agent Engagement (Hours Saved)</h2>
                  </div>
                  <div className="flex items-center gap-5 text-xs font-bold text-white/70 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-aurora-teal shadow-[0_0_8px_#00F0FF]"></div> Time Saved</div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded bg-neon-violet shadow-[0_0_8px_#B026FF]"></div> AI Processing</div>
                  </div>
               </div>

               {/* Grid lines for chart */}
               <div className="absolute inset-0 top-20 pointer-events-none flex flex-col justify-between py-10 px-6 opacity-10">
                 <div className="w-full border-t border-white border-dashed"></div>
                 <div className="w-full border-t border-white border-dashed"></div>
                 <div className="w-full border-t border-white border-dashed"></div>
               </div>

               {/* Mock Chart Area */}
               <div className="flex-1 flex items-end gap-2 md:gap-8 justify-between pt-4 mt-auto relative z-10">
                 {/* Day bars */}
                 {[40, 65, 30, 80, 55, 90, 70].map((h, i) => (
                   <div key={i} className="flex-1 flex flex-col items-center gap-3 group cursor-pointer relative">
                     <div className="w-full max-w-[40px] flex items-end justify-center gap-1 md:gap-1.5 relative h-32 md:h-40 bg-white/5 rounded-t-lg group-hover:bg-white/10 transition-colors">
                        {/* Tooltip */}
                        <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-black border border-white/10 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-xl z-10 pointer-events-none whitespace-nowrap">
                          {h} Hrs Saved
                        </div>
                        <div className="flex-1 bg-gradient-to-t from-neon-violet/50 to-neon-violet rounded-t-sm transition-all duration-500 hover:brightness-125" style={{ height: `${h * 0.4}%` }}></div>
                        <div className="flex-1 bg-gradient-to-t from-aurora-teal/50 to-aurora-teal rounded-t-sm transition-all duration-500 shadow-[0_0_10px_rgba(0,240,255,0.2)] hover:shadow-[0_0_15px_rgba(0,240,255,0.5)]" style={{ height: `${h}%` }}></div>
                     </div>
                     <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest group-hover:text-white transition-colors">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                   </div>
                 ))}
               </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Dashboard;

