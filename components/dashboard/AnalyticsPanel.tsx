"use client";

import { useEffect, useState } from "react";
import { Activity, Users, Clock, MessageSquare, TrendingUp, TrendingDown, Minus, X, FileText } from "lucide-react";

interface MeetingAnalyticsSummary {
  meetingId: string;
  meetingDate: string;
  speakerCount: number;
  totalTalkTimeMs: number;
  avgEngagementScore: number;
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

export function AnalyticsPanel() {
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
  }, []);

  return (
    <>
      <div className="glass-card rounded-3xl p-6 border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity size={18} className="text-aurora-teal" />
            <h2 className="text-white font-bold">Meeting Analytics</h2>
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : analytics.length === 0 ? (
          <div className="text-center py-8 text-white/30 text-sm">
            <Activity size={32} className="mx-auto mb-2 opacity-30" />
            <p>No analytics yet</p>
            <p className="text-xs mt-1">Host a meeting to see analytics</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {analytics.map((item, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedMeeting(item.meetingId)}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-aurora-teal/30 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-aurora-teal/10 flex items-center justify-center">
                    <Activity size={14} className="text-aurora-teal" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-chalk-white font-mono">
                      {item.meetingId.substring(0, 10)}...
                    </div>
                    <div className="text-[10px] text-white/40">
                      {new Date(item.meetingDate).toLocaleDateString()} · {item.speakerCount} speakers
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-aurora-teal font-bold">
                    {item.avgEngagementScore}%
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedMeeting && (
        <MeetingAnalyticsPopup meetingId={selectedMeeting} onClose={() => setSelectedMeeting(null)} />
      )}
    </>
  );
}

function MeetingAnalyticsPopup({ meetingId, onClose }: { meetingId: string; onClose: () => void }) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/meetings/analytics?meetingId=${meetingId}`)
      .then(res => res.json())
      .then(d => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("Failed"))
      .finally(() => setLoading(false));
  }, [meetingId]);

  function formatDuration(ms: number) {
    const min = Math.floor(ms / 60000);
    return min > 0 ? `${min}m` : `${Math.floor(ms / 1000)}s`;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg glass-card rounded-3xl border-white/10 p-6 bg-obsidian-black max-h-[85vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full">
          <X size={20} className="text-white/50" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <Activity size={24} className="text-aurora-teal" />
          <div>
            <h2 className="text-xl font-bold text-chalk-white">Analytics</h2>
            <p className="text-xs text-white/40 font-mono">{meetingId}</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-4 gap-3">
              {[1,2,3,4].map(i => <div key={i} className="h-16 bg-white/5 rounded-lg" />)}
            </div>
          </div>
        ) : error || !data ? (
          <div className="text-center py-12 text-white/30">
            <FileText size={48} className="mx-auto mb-4 opacity-30" />
            <p>No analytics available</p>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="flex justify-end">
              <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                data.analytics.summary.overallSentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
                data.analytics.summary.overallSentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {data.analytics.summary.overallSentiment}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-[10px] text-white/40 uppercase mb-1 flex items-center gap-1"><Clock size={10}/> Duration</div>
                <div className="text-lg font-bold">{formatDuration(data.analytics.summary.totalTalkTimeMs)}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-[10px] text-white/40 uppercase mb-1 flex items-center gap-1"><MessageSquare size={10}/> Words</div>
                <div className="text-lg font-bold">{data.analytics.summary.totalWords}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-[10px] text-white/40 uppercase mb-1 flex items-center gap-1"><Users size={10}/> Speakers</div>
                <div className="text-lg font-bold">{data.analytics.summary.speakerCount}</div>
              </div>
              <div className="bg-white/5 rounded-xl p-3">
                <div className="text-[10px] text-white/40 uppercase mb-1 flex items-center gap-1"><Activity size={10}/> Engagement</div>
                <div className="text-lg font-bold text-aurora-teal">{data.analytics.summary.avgEngagementScore}%</div>
              </div>
            </div>

            {(() => {
              const humanSpeakers = data.analytics.speakers
                .filter((s: any) => !s.speakerName?.toLowerCase().includes('agent'));
              const uniqueSpeakers = Array.from(new Set(humanSpeakers.map((s: any) => s.speakerName?.trim())))
                .map(name => humanSpeakers.find((s: any) => s.speakerName?.trim() === name));
              return (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-white/40">Participants ({uniqueSpeakers.length})</h3>
                  {uniqueSpeakers.map((s: any, i: number) => {
                    const max = Math.max(...humanSpeakers.map((x: any) => x.talkTimeMs), 1);
                    return (
                      <div key={i} className="bg-white/5 rounded-xl p-3">
                        <div className="flex justify-between mb-2">
                          <span className="font-medium text-sm">{s?.speakerName}</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full">
                          <div className="h-full bg-gradient-to-r from-electric-blue to-aurora-teal" style={{ width: `${(s?.talkTimeMs / max) * 100}%` }} />
                        </div>
                        <div className="flex gap-3 mt-2 text-[10px] text-white/30">
                          <span>{formatDuration(s?.talkTimeMs)}</span>
                          <span>{s?.wordCount} words</span>
                          <span>{s?.speakingTurns} turns</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}