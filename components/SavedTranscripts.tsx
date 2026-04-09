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

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-4">
        <p className="text-gray-400">Loading transcripts...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Saved Transcripts</h2>
        <Link
          href={`/meeting/${meetingId}`}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors"
        >
          Back to Meeting
        </Link>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {transcripts.map((transcript) => (
          <div key={transcript.id} className="bg-gray-700 rounded p-3 group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-blue-400">
                {transcript.speakerName || 'Unknown'}:
              </span>
              <span className="text-xs text-gray-400">
                [{new Date(transcript.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]
              </span>
            </div>
            <p className="text-white">{transcript.content}</p>
            <button
              onClick={() => deleteTranscript(transcript.id)}
              className="text-red-400 hover:text-red-300 text-sm mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Delete
            </button>
          </div>
        ))}
        
        {transcripts.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No transcripts saved yet
          </p>
        )}
      </div>
    </div>
  );
}