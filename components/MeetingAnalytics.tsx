"use client";

import { useEffect, useState } from "react";
import { Activity, Users, Clock, MessageSquare, TrendingUp, TrendingDown, Minus } from "lucide-react";

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
      avgEngagementScore: number;
      overallSentiment: string;
    };
  };
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

function getSentimentColor(score: number | null): string {
  if (score === null) return "text-white/30";
  if (score > 10) return "text-green-400";
  if (score < -10) return "text-red-400";
  return "text-yellow-400";
}

export function MeetingAnalytics({ meetingId }: { meetingId: string }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
  }, [meetingId]);

  if (loading) {
    return (
      <div className="glass-card rounded-3xl p-6 border-white/5">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-1/3"></div>
          <div className="grid grid-cols-4 gap-4">
            <div className="h-20 bg-white/5 rounded"></div>
            <div className="h-20 bg-white/5 rounded"></div>
            <div className="h-20 bg-white/5 rounded"></div>
            <div className="h-20 bg-white/5 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass-card rounded-3xl p-6 border-white/5">
        <div className="flex items-center gap-3 text-white/40">
          <Activity size={20} />
          <span>No analytics available yet. Analytics are generated after the meeting ends.</span>
        </div>
      </div>
    );
  }

  const { analytics } = data;
  const maxTalkTime = Math.max(...analytics.speakers.map(s => s.talkTimeMs), 1);

  return (
    <div className="glass-card rounded-3xl p-6 border-white/5 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity size={20} className="text-aurora-teal" />
          <h2 className="text-lg font-bold text-chalk-white">Conversation Analytics</h2>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
          analytics.summary.overallSentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
          analytics.summary.overallSentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
          'bg-yellow-500/20 text-yellow-400'
        }`}>
          {analytics.summary.overallSentiment}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-2 text-white/40 mb-2">
            <Clock size={14} />
            <span className="text-xs font-medium uppercase">Duration</span>
          </div>
          <div className="text-2xl font-bold text-chalk-white">
            {formatDuration(analytics.summary.totalTalkTimeMs)}
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-2 text-white/40 mb-2">
            <MessageSquare size={14} />
            <span className="text-xs font-medium uppercase">Words</span>
          </div>
          <div className="text-2xl font-bold text-chalk-white">
            {analytics.summary.totalWords.toLocaleString()}
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-2 text-white/40 mb-2">
            <Users size={14} />
            <span className="text-xs font-medium uppercase">Speakers</span>
          </div>
          <div className="text-2xl font-bold text-chalk-white">
            {analytics.summary.speakerCount}
          </div>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-2 text-white/40 mb-2">
            <Activity size={14} />
            <span className="text-xs font-medium uppercase">Engagement</span>
          </div>
          <div className="text-2xl font-bold text-aurora-teal">
            {analytics.summary.avgEngagementScore}%
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white/60 uppercase tracking-wider">Speaker Breakdown</h3>
        {analytics.speakers.map((speaker, idx) => (
          <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  speaker.speakerName.toLowerCase().includes('agent') 
                    ? 'bg-neon-violet/20 text-neon-violet' 
                    : 'bg-electric-blue/20 text-electric-blue'
                }`}>
                  {speaker.speakerName.charAt(0).toUpperCase()}
                </div>
                <span className="font-bold text-chalk-white">{speaker.speakerName}</span>
                {getSentimentIcon(speaker.sentimentScore)}
              </div>
              <span className={`text-xs font-bold ${getSentimentColor(speaker.sentimentScore)}`}>
                {speaker.sentimentScore !== null ? `${speaker.sentimentScore > 0 ? '+' : ''}${Math.round(speaker.sentimentScore)}` : 'N/A'}
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-white/40">
                <span>Talk Time</span>
                <span className="text-white/60">{formatDuration(speaker.talkTimeMs)}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-electric-blue to-aurora-teal rounded-full"
                  style={{ width: `${(speaker.talkTimeMs / maxTalkTime) * 100}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-3 pt-3 border-t border-white/5">
                <div className="text-center">
                  <div className="text-lg font-bold text-chalk-white">{speaker.wordCount}</div>
                  <div className="text-[10px] text-white/40 uppercase">Words</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-chalk-white">{speaker.speakingTurns}</div>
                  <div className="text-[10px] text-white/40 uppercase">Turns</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}