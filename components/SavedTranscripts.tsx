'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Transcript {
  id: string;
  meetingId: string;
  speakerId: string | null;
  speakerName: string | null;
  content: string;
  timestamp: Date;
  isAI?: boolean | null;
}

interface SavedTranscriptsProps {
  meetingId: string;
}

export function SavedTranscripts({ meetingId }: SavedTranscriptsProps) {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTranscripts();
  }, [meetingId]);

  const fetchTranscripts = async () => {
    try {
      const res = await fetch(`/api/transcription?meetingId=${meetingId}`);
      const data = await res.json();
      setTranscripts(data.transcripts || []);
    } catch (error) {
      console.error('Failed to fetch transcripts:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTranscript = async (id: string) => {
    try {
      await fetch('/api/transcription', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      setTranscripts(prev => prev.filter(t => t.id !== id));
    } catch (error) {
      console.error('Failed to delete transcript:', error);
    }
  };

  const downloadTranscripts = () => {
    if (transcripts.length === 0) return;

    const log = transcripts
      .map(t => `[${new Date(t.timestamp).toLocaleTimeString()}] ${t.isAI ? 'AGENT' : t.speakerName}: ${t.content}`)
      .reverse() // Sort chronological for the text file
      .join('\n');

    const blob = new Blob([log], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-${meetingId}-transcript.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-t-2 border-aurora-teal rounded-full animate-spin" />
            <p className="text-[10px] uppercase tracking-[0.2em] text-chalk-white/30 font-bold">Retrieving Records</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-obsidian-black/40 border border-white/5 backdrop-blur-xl">
      <div className="flex items-center justify-between p-6 border-b border-white/5">
        <h2 className="text-sm font-bold text-chalk-white tracking-widest uppercase opacity-80">Conversation History</h2>
        <div className="flex items-center gap-3">
            <button
              onClick={downloadTranscripts}
              disabled={transcripts.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-aurora-teal/10 hover:bg-aurora-teal/20 border border-aurora-teal/30 rounded-xl text-[10px] font-bold text-aurora-teal uppercase tracking-widest transition-all duration-300 disabled:opacity-20 disabled:cursor-not-allowed"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export TXT
            </button>
            <Link
              href={`/meeting/${meetingId}`}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold text-chalk-white uppercase tracking-widest transition-all duration-300"
            >
              <svg className="w-3 h-3 rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
              Return to Live
            </Link>
        </div>
      </div>
      
      <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar">
        {transcripts.map((transcript) => (
          <div key={transcript.id} className="group flex flex-col gap-2 relative">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-bold text-aurora-teal uppercase tracking-widest bg-aurora-teal/10 px-2 py-0.5 rounded-md">
                    {transcript.speakerName || 'Anonymous'}:
                </span>
                <span className="text-[10px] text-chalk-white/20 font-mono">
                    {new Date(transcript.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              <button
                onClick={() => deleteTranscript(transcript.id)}
                className="text-red-500/40 hover:text-red-500 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0 outline-none"
              >
                Delete Record
              </button>
            </div>
            <p className="text-sm text-chalk-white/80 leading-relaxed pl-1">
              {transcript.content}
            </p>
            <div className="absolute -left-3 top-0 bottom-0 w-0.5 bg-white/5 group-hover:bg-aurora-teal/30 transition-colors" />
          </div>
        ))}
        
        {transcripts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 opacity-20">
            <div className="w-12 h-12 rounded-2xl border border-chalk-white mb-4 flex items-center justify-center rotate-45">
              <div className="w-4 h-4 border-2 border-chalk-white rounded-sm -rotate-45" />
            </div>
            <p className="text-xs uppercase tracking-[0.3em] font-medium text-center">
              No conversation data<br />found for this session
            </p>
          </div>
        )}
      </div>

      <div className="p-6 bg-white/[0.02] border-t border-white/5 flex items-center justify-between">
         <span className="text-[10px] text-chalk-white/30 font-medium">TOTAL UTTERANCES: {transcripts.length}</span>
         <span className="text-[10px] text-aurora-teal/50 font-bold uppercase tracking-widest">End of Log</span>
      </div>
    </div>
  );
}