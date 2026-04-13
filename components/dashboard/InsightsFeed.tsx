"use client";

import { useEffect, useState } from "react";
import { 
  Zap, CheckCircle2, Activity,
} from "lucide-react";
import { SummaryModal } from "./SummaryModal";
import { useRouter } from "next/navigation";

interface InsightsFeedProps {
    initialInsights: any[];
}

export function InsightsFeed({ initialInsights }: InsightsFeedProps) {
    const [selectedSummary, setSelectedSummary] = useState<any>(null);
    const [isViewAllOpen, setIsViewAllOpen] = useState(false);
    const router = useRouter();

    // Automatic background refresh to catch new summaries
    useEffect(() => {
        const interval = setInterval(() => {
            router.refresh();
        }, 5000);
        return () => clearInterval(interval);
    }, [router]);

    const latestInsight = initialInsights[0];

    return (
        <div className="glass-card rounded-3xl p-6 border border-white/5 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Zap size={18} className="text-aurora-teal" />
                    <h2 className="text-white font-bold text-lg">Agentic Intelligence</h2>
                </div>
                {initialInsights.length > 1 && (
                    <button 
                        onClick={() => setIsViewAllOpen(true)}
                        className="text-xs font-semibold text-white/50 hover:text-white transition-colors"
                    >
                        View All ({initialInsights.length})
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {!latestInsight ? (
                    <div className="flex flex-col items-center justify-center h-full text-white/30 gap-4 opacity-50">
                        <Zap size={40} className="stroke-white/10" />
                        <p className="text-sm font-medium">No insights generated yet.</p>
                    </div>
                ) : (
                    <div 
                        onClick={() => setSelectedSummary(latestInsight)}
                        className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-neon-violet/30 hover:border-neon-violet/60 transition-all cursor-pointer group hover:bg-white/[0.07] relative overflow-hidden"
                    >
                        {/* Glow effect for latest */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-neon-violet/10 rounded-full blur-2xl pointer-events-none" />
                        
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-2.5 h-2.5 rounded-full bg-neon-violet shadow-[0_0_10px_#B026FF]"></div>
                            <span className="text-xs font-black text-white uppercase tracking-widest">
                                Latest Intelligence
                            </span>
                            <span className="text-[10px] uppercase font-bold text-white/30 ml-auto leading-none">
                                {new Date(latestInsight.createdAt).toLocaleDateString(undefined, {
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </span>
                        </div>

                        <h3 className="text-sm font-bold text-white/90 mb-2 truncate">
                            {latestInsight.meetingTitle || "Unnamed Session"}
                        </h3>
                        
                        <p className="text-xs text-white/50 mb-6 line-clamp-3 italic leading-relaxed">
                            "{latestInsight.executiveSummary}"
                        </p>

                        <div className="space-y-3">
                            {latestInsight.actionItems && latestInsight.actionItems.length > 0 && (
                                <div className="flex gap-3 items-center">
                                    <div className="w-6 h-6 rounded-full bg-aurora-teal/10 flex items-center justify-center border border-aurora-teal/20">
                                        <CheckCircle2 size={12} className="text-aurora-teal" />
                                    </div>
                                    <p className="text-[11px] font-bold text-white/70">
                                        {latestInsight.actionItems.length} Action Items
                                    </p>
                                </div>
                            )}
                            {latestInsight.decisions && latestInsight.decisions.length > 0 && (
                                <div className="flex gap-3 items-center">
                                    <div className="w-6 h-6 rounded-full bg-neon-violet/10 flex items-center justify-center border border-neon-violet/20">
                                        <Activity size={12} className="text-neon-violet" />
                                    </div>
                                    <p className="text-[11px] font-bold text-white/70">
                                        {latestInsight.decisions.length} Critical Decisions
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* View All Modal */}
            {isViewAllOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
                    <div className="absolute inset-0 bg-obsidian-black/80 backdrop-blur-md" onClick={() => setIsViewAllOpen(false)} />
                    <div className="glass-card w-full max-w-2xl max-h-[80vh] rounded-3xl border border-white/10 flex flex-col relative z-10 animate-in fade-in zoom-in duration-300">
                        <div className="p-6 border-b border-white/5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white flex items-center gap-3">
                                <Zap className="text-aurora-teal" /> Meeting History
                            </h2>
                            <button onClick={() => setIsViewAllOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/50 hover:text-white">
                                <Activity size={20} className="rotate-45" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {initialInsights.map((insight) => (
                                <div 
                                    key={insight.id}
                                    onClick={() => {
                                        setSelectedSummary(insight);
                                        setIsViewAllOpen(false);
                                    }}
                                    className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-all cursor-pointer flex items-center justify-between group"
                                >
                                    <div>
                                        <h4 className="text-sm font-bold text-white group-hover:text-aurora-teal transition-colors">
                                            {insight.meetingTitle || "Unnamed Meeting"}
                                        </h4>
                                        <p className="text-[10px] text-white/30 uppercase font-black tracking-widest mt-1">
                                            {new Date(insight.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 text-white/20 group-hover:text-white/60 transition-colors">
                                        <div className="text-right">
                                            <p className="text-[10px] font-bold">{insight.actionItems?.length || 0} Actions</p>
                                            <p className="text-[10px] font-bold">{insight.decisions?.length || 0} Decisions</p>
                                        </div>
                                        <Zap size={14} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <SummaryModal 
                isOpen={!!selectedSummary} 
                onClose={() => setSelectedSummary(null)} 
                summary={selectedSummary}
            />
        </div>
    );
}
