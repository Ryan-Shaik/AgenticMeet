"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Home, Video, BarChart2, FileText, Settings
} from "lucide-react";
import { useSession } from "@/lib/auth-client";
import Image from "next/image";
import { LogoutButton } from "@/components/auth/logout-button";

interface Transcript {
  id: string;
  meetingId: string;
  meetingTitle: string | null;
  speakerName: string | null;
  content: string;
  timestamp: string;
}

export default function AllTranscriptsPage() {
  const { data: session } = useSession();
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
    <div className="min-h-screen bg-obsidian-black text-chalk-white font-sans flex overflow-hidden">
      {/* Left Navigation */}
      <nav className="w-20 border-r border-white/5 bg-black/50 flex flex-col items-center py-6 gap-8 z-20 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-blue to-aurora-teal flex items-center justify-center font-bold text-xl text-white shadow-[0_0_15px_rgba(0,240,255,0.4)]">
          A
        </div>
        <div className="flex flex-col gap-6 flex-1 mt-4 text-white/50">
          <Link href="/" className="p-3 rounded-xl bg-electric-blue/10 text-electric-blue hover:text-aurora-teal transition-colors relative group">
            <Home size={22} />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-electric-blue rounded-r-md"></div>
          </Link>
          <Link href="#" className="p-3 rounded-xl hover:bg-white/5 hover:text-white transition-colors" title="Meetings"><Video size={22} /></Link>
          <Link href="#" className="p-3 rounded-xl hover:bg-white/5 hover:text-white transition-colors" title="Analytics"><BarChart2 size={22} /></Link>
          <Link href="/transcripts" className="p-3 rounded-xl bg-white/10 text-white hover:text-aurora-teal transition-colors" title="Transcripts"><FileText size={22} /></Link>
        </div>
        <Link href="#" className="p-3 rounded-xl hover:bg-white/5 text-white/50 hover:text-white transition-colors" title="Settings"><Settings size={22} /></Link>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        {/* Background Mesh */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-electric-blue/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-neon-violet/5 rounded-full blur-[150px] pointer-events-none" />

        {/* Top Header */}
        <header className="px-8 py-6 flex items-center justify-between border-b border-white/5 bg-obsidian-black/80 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Meeting Transcripts</h1>
            <p className="text-sm font-medium text-white/50 mt-1">Search and view all meeting transcripts</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-aurora-teal/10 border border-aurora-teal/30 text-aurora-teal text-xs font-bold uppercase tracking-widest shadow-[0_0_10px_rgba(0,240,255,0.1)]">
              <div className="w-2 h-2 rounded bg-aurora-teal"></div> Pro Plan
            </div>
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
          <div className="lg:col-span-12 max-w-6xl mx-auto">

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
      </div>
    </div>
  );
}