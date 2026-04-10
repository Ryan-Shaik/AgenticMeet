"use client";

import { 
  X, CheckCircle2, Activity,
  Calendar, Zap, MessageSquare,
  ArrowRight
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface SummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    summary: any;
}

export function SummaryModal({ isOpen, onClose, summary }: SummaryModalProps) {
    if (!isOpen || !summary) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            
            {/* Modal Content */}
            <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto glass-card rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col animate-in fade-in zoom-in duration-300">
                {/* Header Section */}
                <div className="p-8 border-b border-white/5 relative bg-gradient-to-br from-electric-blue/5 to-transparent">
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-white/50 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-center gap-2 mb-2">
                        <Zap size={16} className="text-aurora-teal" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-aurora-teal/70">Agentic Insight Report</span>
                    </div>
                    
                    <h2 className="text-3xl font-black text-white tracking-tight mb-4">
                        {summary.meetingTitle || "Meeting Summary"}
                    </h2>

                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2 text-xs font-bold text-white/50">
                            <Calendar size={14} />
                            {new Date(summary.createdAt).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                        <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-wider text-white/70">
                            Sentiment: <span className={summary.sentiment === "Positive" ? "text-aurora-teal" : "text-white"}>{summary.sentiment}</span>
                        </div>
                    </div>
                </div>

                {/* Body Section */}
                <div className="p-8 space-y-8 h-full">
                    {/* Executive Summary */}
                    <section>
                        <h3 className="text-sm font-black uppercase tracking-widest text-white/30 mb-4">Executive Summary</h3>
                        <p className="text-lg font-medium text-white/90 leading-relaxed italic border-l-2 border-electric-blue/30 pl-6">
                            "{summary.executiveSummary}"
                        </p>
                    </section>

                    {/* Topics Grid */}
                    <section>
                        <h3 className="text-sm font-black uppercase tracking-widest text-white/30 mb-4">Discussion Topics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {summary.topics?.map((topic: any, i: number) => (
                                <div key={i} className="p-5 rounded-3xl bg-white/5 border border-white/5 hover:border-electric-blue/20 transition-all group">
                                    <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-electric-blue group-hover:shadow-[0_0_8px_#00F0FF] transition-all"></div>
                                        {topic.title}
                                    </h4>
                                    <ul className="space-y-2">
                                        {topic.points?.map((p: string, j: number) => (
                                            <li key={j} className="text-xs text-white/60 leading-tight flex gap-2">
                                                <ArrowRight size={12} className="shrink-0 mt-0.5 opacity-30" />
                                                {p}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Action Items & Decisions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Action Items */}
                        <section>
                            <h3 className="text-sm font-black uppercase tracking-widest text-white/30 mb-4">Action Items</h3>
                            <div className="space-y-3">
                                {summary.actionItems?.map((item: any, i: number) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-aurora-teal/5 border border-aurora-teal/10">
                                        <CheckCircle2 size={18} className="text-aurora-teal shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-sm font-bold text-white/90 leading-tight">{item.task}</p>
                                            {item.assignee && (
                                                <p className="text-[10px] font-black uppercase tracking-wider text-aurora-teal/60 mt-2">Owner: {item.assignee}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Decisions */}
                        <section>
                            <h3 className="text-sm font-black uppercase tracking-widest text-white/30 mb-4">Decisions</h3>
                            <div className="space-y-3">
                                {summary.decisions?.map((decision: string, i: number) => (
                                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-neon-violet/5 border border-neon-violet/10">
                                        <Activity size={18} className="text-neon-violet shrink-0 mt-0.5" />
                                        <p className="text-sm font-bold text-white/90 leading-tight">{decision}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="p-8 bg-black/40 border-t border-white/5 flex justify-end">
                    <Button 
                        onClick={onClose}
                        className="bg-white/5 hover:bg-white/10 text-white rounded-2xl px-8 border border-white/10"
                    >
                        Close Report
                    </Button>
                </div>
            </div>
        </div>
    );
}
