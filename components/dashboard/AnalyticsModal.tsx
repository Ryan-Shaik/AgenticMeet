"use client";

import { useEffect, useState } from "react";
import { X, Activity, Users, Clock, MessageSquare, TrendingUp, TrendingDown, Minus, FileText } from "lucide-react";

interface SpeakerAnalytics {
  speakerName: string;
  talkTimeMs: number;
  wordCount: number;
  speakingTurns: number;
  sentimentScore: number | null;
  engagementScore: number | null;
}

interface AnalyticsData {
  meetingId: string;
  meetingTitle: string;
  meetingDate: string;
  analytics: {
    speakers: SpeakerAnalytics[];
    summary: {
      totalTalkTimeMs: number;
      totalWords: number;
      totalSpeakingTurns: number;
      speakerCount: number;
      overallEngagementScore: number;
      overallSentiment: string;
    };
  };
}

interface AnalyticsModalProps {
  meetingId: string;
  isOpen: boolean;
  onClose: () => void;
}

function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  }
  return `${seconds}s`;
}

function getSentimentIcon(score: number | null) {
  if (score === null) return <Minus size={16} className="text-white/30" />;
  if (score > 10) return <TrendingUp size={16} className="text-green-400" />;
  if (score < -10) return <TrendingDown size={16} className="text-red-400" />;
  return <Minus size={16} className="text-yellow-400" />;
}

export function AnalyticsModal({ meetingId, isOpen, onClose }: AnalyticsModalProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !meetingId) return;

    fetch(`/api/meetings/analytics?meetingId=${meetingId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setData(data);
        }
      })
      .catch(err => setError("Failed to load analytics"))
      .finally(() => setLoading(false));
  }, [isOpen, meetingId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto glass-card rounded-3xl border-white/10 p-6 bg-obsidian-black">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X size={20} className="text-white/50" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-aurora-teal/20 flex items-center justify-center">
            <Activity size={20} className="text-aurora-teal" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-chalk-white">Meeting Analytics</h2>
            <p className="text-sm text-white/40 font-mono">{meetingId}</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="grid grid-cols-4 gap-4">
              <div className="h-20 bg-white/5 rounded"></div>
              <div className="h-20 bg-white/5 rounded"></div>
              <div className="h-20 bg-white/5 rounded"></div>
              <div className="h-20 bg-white/5 rounded"></div>
            </div>
          </div>
        ) : error || !data ? (
          <div className="text-center py-12 text-white/40">
            <FileText size={48} className="mx-auto mb-4 opacity-30" />
            <p>No analytics available yet.</p>
            <p className="text-sm mt-2">Analytics are generated after the meeting ends.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                data.analytics.summary.overallSentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
                data.analytics.summary.overallSentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                'bg-yellow-500/20 text-yellow-400'
              }`}>
                {data.analytics.summary.overallSentiment} sentiment
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <div className="flex items-center gap-2 text-white/40 mb-1">
                  <Clock size={12} />
                  <span className="text-[10px] font-medium uppercase">Duration</span>
                </div>
                <div className="text-xl font-bold text-chalk-white">
                  {formatDuration(data.analytics.summary.totalTalkTimeMs)}
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <div className="flex items-center gap-2 text-white/40 mb-1">
                  <MessageSquare size={12} />
                  <span className="text-[10px] font-medium uppercase">Words</span>
                </div>
                <div className="text-xl font-bold text-chalk-white">
                  {data.analytics.summary.totalWords.toLocaleString()}
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <div className="flex items-center gap-2 text-white/40 mb-1">
                  <Users size={12} />
                  <span className="text-[10px] font-medium uppercase">Speakers</span>
                </div>
                <div className="text-xl font-bold text-chalk-white">
                  {data.analytics.summary.speakerCount}
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <div className="flex items-center gap-2 text-white/40 mb-1">
                  <Activity size={12} />
                  <span className="text-[10px] font-medium uppercase">Overall Engagement</span>
                </div>
                <div className="text-xl font-bold text-aurora-teal">
                  {data.analytics.summary.overallEngagementScore}%
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-wider">Speaker Breakdown</h3>
              {data.analytics.speakers.map((speaker, idx) => {
                const maxTalkTime = Math.max(...data.analytics.speakers.map(s => s.talkTimeMs), 1);
                return (
                  <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          speaker.speakerName.toLowerCase().includes('agent') 
                            ? 'bg-neon-violet/20 text-neon-violet' 
                            : 'bg-electric-blue/20 text-electric-blue'
                        }`}>
                          {speaker.speakerName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium text-chalk-white text-sm">{speaker.speakerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getSentimentIcon(speaker.sentimentScore)}
                        <span className="text-xs text-white/40">
                          {speaker.sentimentScore !== null ? `${Math.round(speaker.sentimentScore)}` : 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                      <div 
                        className="h-full bg-gradient-to-r from-electric-blue to-aurora-teal rounded-full"
                        style={{ width: `${(speaker.talkTimeMs / maxTalkTime) * 100}%` }}
                      />
                    </div>
                    <div className="flex gap-4 text-[10px] text-white/40">
                      <span>{formatDuration(speaker.talkTimeMs)}</span>
                      <span>{speaker.wordCount} words</span>
                      <span>{speaker.speakingTurns} turns</span>
                      <span className="text-aurora-teal">{speaker.engagementScore ?? 'N/A'} engagement</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}