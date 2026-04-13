"use client";

import { useEffect, useState } from "react";
import { BarChart2, Clock, Users, Activity, ChevronRight, X } from "lucide-react";

interface MeetingAnalyticsSummary {
  meetingId: string;
  meetingDate: string;
  speakerCount: number;
  totalTalkTimeMs: number;
  avgEngagementScore: number;
}

interface AnalyticsHistoryPanelProps {
  refreshTrigger?: number;
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

export function AnalyticsHistoryPanel({ refreshTrigger }: AnalyticsHistoryPanelProps) {
  const [analytics, setAnalytics] = useState<MeetingAnalyticsSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeeting, setSelectedMeeting] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/meetings/analytics/history')
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setAnalytics(data.history || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  return (
    <>
      <div className="glass-card rounded-3xl p-6 border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart2 size={18} className="text-aurora-teal" />
            <h2 className="text-white font-bold">Analytics History</h2>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : analytics.length === 0 ? (
          <div className="text-center py-8 text-white/30 text-sm">
            <BarChart2 size={32} className="mx-auto mb-2 opacity-30" />
            <p>No analytics yet</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {analytics.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedMeeting(item.meetingId)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-aurora-teal/30 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-aurora-teal/10 flex items-center justify-center">
                    <BarChart2 size={14} className="text-aurora-teal" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-chalk-white font-mono">
                      {item.meetingId.substring(0, 12)}...
                    </div>
                    <div className="text-[10px] text-white/40">
                      {new Date(item.meetingDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-white/40">
                  <span className="flex items-center gap-1">
                    <Users size={10} /> {item.speakerCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Activity size={10} /> {item.avgEngagementScore}%
                  </span>
                  <ChevronRight size={14} className="text-white/20 group-hover:text-aurora-teal transition-colors" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedMeeting(null)} />
          <div className="relative w-full max-w-md glass-card rounded-3xl border-white/10 p-4 bg-obsidian-black max-h-[80vh] overflow-y-auto">
            <button 
              onClick={() => setSelectedMeeting(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/10"
            >
              <X size={16} className="text-white/50" />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 size={18} className="text-aurora-teal" />
              <h3 className="font-bold text-chalk-white">Analytics</h3>
            </div>
            <iframe 
              src={`/meeting/${selectedMeeting}/transcripts`}
              className="w-full h-96 rounded-xl border border-white/10"
            />
          </div>
        </div>
      )}
    </>
  );
}