"use client";

import { 
  Users, PlayCircle, CheckCircle2, 
  RotateCcw, Zap, Loader2
} from "lucide-react";
import { useState } from "react";

interface MeetingActivityProps {
    initialMeetings: any[];
}

export function MeetingActivity({ initialMeetings }: MeetingActivityProps) {
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [meetings, setMeetings] = useState(initialMeetings);

    const handleSummarize = async (meetingId: string) => {
        setLoadingId(meetingId);
        try {
            const resp = await fetch("/api/meetings/summarize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ meetingId }),
            });
            
            if (resp.ok) {
                // Refresh the list status
                setMeetings(prev => prev.map(m => 
                    m.id === meetingId ? { ...m, status: "completed" } : m
                ));
                // Optionally reload the page to refresh the feed
                window.location.reload();
            } else {
                const data = await resp.json();
                alert(`Error: ${data.details || "Failed to generate summary"}`);
            }
        } catch (err) {
            console.error(err);
            alert("Network error occurred.");
        } finally {
            setLoadingId(null);
        }
    };

    return (
        <div className="glass-card rounded-3xl p-6 border border-white/5 h-full relative overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <PlayCircle size={18} className="text-neon-violet" />
                <h2 className="text-white font-bold text-lg">Meeting Activity</h2>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                {meetings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 text-white/20">
                        <Users size={32} className="mb-4 opacity-50" />
                        <p className="text-xs font-bold uppercase tracking-widest">No recent sessions</p>
                    </div>
                ) : (
                    meetings.map((meeting) => (
                        <div key={meeting.id} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all flex flex-col gap-3 group">
                            <div className="flex items-center justify-between">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                                    meeting.status === "completed" 
                                    ? "bg-aurora-teal/10 text-aurora-teal border border-aurora-teal/20" 
                                    : "bg-neon-violet/10 text-neon-violet border border-neon-violet/20"
                                }`}>
                                    {meeting.status || "active"}
                                </span>
                                <span className="text-[10px] font-bold text-white/30">
                                    {new Date(meeting.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            
                            <div>
                                <h3 className="font-bold text-sm leading-tight text-white mb-1 group-hover:text-aurora-teal transition-colors">
                                    {meeting.title || "Unnamed Session"}
                                </h3>
                                <p className="text-[10px] font-medium text-white/40 font-mono">
                                    ID: {meeting.id}
                                </p>
                            </div>

                            <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1">
                                {meeting.status === "completed" ? (
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-aurora-teal/70">
                                        <CheckCircle2 size={12} /> Summary Ready
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => handleSummarize(meeting.id)}
                                        disabled={loadingId === meeting.id}
                                        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white transition-colors disabled:opacity-50"
                                    >
                                        {loadingId === meeting.id ? (
                                            <>
                                                <Loader2 size={12} className="animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <RotateCcw size={12} />
                                                Generate Summary
                                            </>
                                        )}
                                    </button>
                                )}
                                <span className="text-[11px] font-bold text-white/20">Agent Enabled</span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Decorative Pulse Line */}
            <div className="absolute top-0 right-0 h-px bg-gradient-to-l from-aurora-teal/50 to-transparent w-full"></div>
        </div>
    );
}
