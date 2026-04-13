"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Transcript {
  id: string;
  meetingId: string;
  meetingTitle: string | null;
  speakerName: string | null;
  content: string;
  timestamp: string;
}

export default function AllTranscriptsPage() {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedMeeting, setExpandedMeeting] = useState<string | null>(null);

  const fetchTranscripts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);

      const res = await fetch(`/api/transcription/search?${params}`);
      const data = await res.json();
      setTranscripts(data.transcripts || []);
    } catch (error) {
      console.error("Failed to fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTranscript = async (id: string) => {
    if (!confirm("Delete this transcript?")) return;
    try {
      await fetch('/api/transcription', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      fetchTranscripts();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const deleteAllTranscript = async (meetingId: string) => {
    if (!confirm("Delete ALL transcripts for this meeting?")) return;
    try {
      const meetingTranscripts = transcripts.filter(t => t.meetingId === meetingId);
      for (const t of meetingTranscripts) {
        await fetch('/api/transcription', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: t.id }),
        });
      }
      fetchTranscripts();
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  useEffect(() => {
    fetchTranscripts();
  }, []);

  const groupByMeeting: Record<string, Transcript[]> = {};
  transcripts.forEach(t => {
    if (!groupByMeeting[t.meetingId]) {
      groupByMeeting[t.meetingId] = [];
    }
    groupByMeeting[t.meetingId].push(t);
  });

  return (
    <div className="min-h-screen bg-obsidian-black text-chalk-white font-sans p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Meeting Transcripts</h1>
          <p className="text-white/50">Search and view all meeting transcripts</p>
        </header>

        <div className="glass-card rounded-2xl p-4 mb-6 border border-white/5">
          <div className="flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Search keywords..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 min-w-[200px] bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-white/30"
            />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white"
            />
            <button
              onClick={fetchTranscripts}
              className="px-6 py-2 bg-aurora-teal text-obsidian-black font-bold rounded-xl"
            >
              Search
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-t-2 border-aurora-teal rounded-full animate-spin" />
          </div>
        ) : Object.keys(groupByMeeting).length === 0 ? (
          <div className="text-center py-20 text-white/30">No transcripts found</div>
        ) : (
          <div className="space-y-4">
            {Object.entries(groupByMeeting).map(([meetingId, items]) => (
              <div key={meetingId} className="glass-card rounded-2xl border border-white/5 overflow-hidden">
                <button
                  onClick={() => setExpandedMeeting(expandedMeeting === meetingId ? null : meetingId)}
                  className="w-full flex items-center justify-between p-4 hover:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-aurora-teal/20 flex items-center justify-center">T</div>
                    <div className="text-left">
                      <div className="font-bold">{meetingId}</div>
                      <div className="text-xs text-white/40">
                        {items.length} messages · {new Date(items[0].timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </button>

                {expandedMeeting === meetingId && (
                  <div className="p-4 pt-0 space-y-2 border-t border-white/5">
                    {items.map((t, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm group">
                        <button onClick={() => deleteTranscript(t.id)} className="text-red-500/30 hover:text-red-500 text-xs opacity-0 group-hover:opacity-100">
                          Delete
                        </button>
                        <div className="w-20 shrink-0 text-xs text-white/30">
                          {new Date(t.timestamp).toLocaleTimeString()}
                        </div>
                        <div className={`shrink-0 w-24 text-xs font-bold ${
                          t.speakerName?.toLowerCase().includes('agent') ? 'text-neon-violet' : 'text-aurora-teal'
                        }`}>
                          {t.speakerName}
                        </div>
                        <div className="text-white/80 flex-1">{t.content}</div>
                      </div>
                    ))}
                    <div className="flex justify-between pt-2">
                      <button onClick={() => deleteAllTranscript(meetingId)} className="text-red-500 text-xs hover:underline">
                        Delete All for this Meeting
                      </button>
                      <Link href={`/meeting/${meetingId}/transcripts`} className="text-aurora-teal text-sm hover:underline">
                        View Full →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 text-center text-white/30 text-sm">
          Found: {transcripts.length} transcripts
        </div>
      </div>
    </div>
  );
}