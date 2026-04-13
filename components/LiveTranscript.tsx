'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRoomContext } from '@livekit/components-react';
import { RoomEvent, TranscriptionSegment, Participant } from 'livekit-client';

interface Transcript {
  id: string;
  speakerName: string;
  content: string;
  timestamp: Date;
  isAI?: boolean;
}

interface LiveTranscriptProps {
  meetingId: string;
  userName: string;
}

export function LiveTranscript({ meetingId, userName }: LiveTranscriptProps) {
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [interimTranscripts, setInterimTranscripts] = useState<Record<string, string>>({});
  const [isListening, setIsListening] = useState(false);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const room = useRoomContext();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('[LiveTranscript] Web Speech API not supported');
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onstart = () => {
      console.log('[LiveTranscript] Web Speech recognition started');
      setIsListening(true);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onend = () => {
      console.log('[LiveTranscript] Web Speech recognition ended');
      setIsListening(false);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      // Ignore "aborted" - happens when user leaves or mic toggle
      if (event.error === 'aborted') return;
      console.warn('[LiveTranscript] Speech recognition error:', event.error);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          const text = result[0].transcript.trim();
          if (text) {
            const newTranscript: Transcript = {
              id: crypto.randomUUID(),
              speakerName: userName,
              content: text,
              timestamp: new Date(),
              isAI: false,
            };
            setTranscripts(prev => [...prev, newTranscript]);

            fetch('/api/transcription', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                meetingId,
                speakerName: userName,
                content: text,
              }),
            }).then(res => res.json()).then(data => {
              console.log('[Transcript] Saved:', data);
            }).catch(console.error);

            // Trigger AI response automatically after user speaks
            fetch('/api/ai/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ meetingId, lastSpeaker: userName }),
            }).then(res => res.json()).then(data => {
              if (data.shouldSpeak && data.message) {
                const aiTranscript: Transcript = {
                  id: crypto.randomUUID(),
                  speakerName: 'Agentic AI',
                  content: data.message,
                  timestamp: new Date(),
                  isAI: true,
                };
                setTranscripts(prev => [...prev, aiTranscript]);
                
                fetch('/api/transcription', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    meetingId,
                    speakerName: 'Agentic AI',
                    content: data.message,
                  }),
                }).catch(console.error);
              }
            }).catch(console.error);
          }
        } else {
          const interimText = result[0].transcript.trim();
          if (interimText) {
            setInterimTranscripts(prev => ({ ...prev, [userName]: interimText }));
          }
        }
      }
    };

    recognition.start();
    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [meetingId, userName]);

  useEffect(() => {
    if (!room) return;

    const handleTranscription = (segments: TranscriptionSegment[], participant?: Participant) => {
      const participantId = participant?.identity || "Unknown";
      
      const partialText = segments
        .filter(s => !s.final)
        .map(s => s.text)
        .join(' ')
        .trim();
        
      if (partialText) {
        setInterimTranscripts(prev => ({
          ...prev,
          [participantId]: partialText
        }));
      }

      const finalSegments = segments.filter(s => s.final);
      if (finalSegments.length === 0) return;

      const text = finalSegments.map(s => s.text).join(' ').trim();
      if (!text) return;

      setInterimTranscripts(prev => {
        const next = { ...prev };
        delete next[participantId];
        return next;
      });

      const isAI = participant?.identity.toLowerCase().includes('agent') || 
                   participant?.identity.toLowerCase().includes('assistant');

      const newTranscript: Transcript = {
        id: crypto.randomUUID(),
        speakerName: participant?.identity || "Participant",
        content: text,
        timestamp: new Date(),
        isAI: isAI
      };

      setTranscripts(prev => [...prev, newTranscript]);

      fetch('/api/transcription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId,
          speakerName: participant?.identity || "Participant",
          content: text,
        }),
      }).catch(console.error);
    };

    room.on(RoomEvent.TranscriptionReceived, handleTranscription);
    return () => {
      room.off(RoomEvent.TranscriptionReceived, handleTranscription);
    };
  }, [room, meetingId]);

  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTo({
        top: transcriptContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [transcripts, interimTranscripts]);

  return (
    <div className="glass-card rounded-2xl p-4 flex flex-col gap-4 border-white/5 bg-obsidian-black/40 overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <h2 className="text-sm font-bold text-chalk-white tracking-tight uppercase opacity-60">Meeting Transcript</h2>
        <span className="text-[10px] text-aurora-teal font-bold uppercase tracking-widest flex items-center gap-1.5 bg-aurora-teal/10 px-2 py-0.5 rounded-full border border-aurora-teal/20">
          <span className="w-1.5 h-1.5 bg-aurora-teal rounded-full animate-pulse shadow-[0_0_8px_#00F0FF]"></span>
          {isListening ? 'Listening' : 'Ready'}
        </span>
      </div>
      
      <div ref={transcriptContainerRef} className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
        {transcripts.map((transcript) => (
          <div key={transcript.id} className="flex flex-col gap-1 slide-up">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${transcript.isAI ? 'text-neon-violet' : 'text-aurora-teal'}`}>
                {transcript.isAI ? 'Agentic AI' : transcript.speakerName === userName ? 'You' : transcript.speakerName}
              </span>
              <span className="text-[9px] text-chalk-white/30 font-mono">
                {transcript.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className={`text-sm text-chalk-white/90 leading-relaxed p-3 rounded-2xl rounded-tl-none border ${transcript.isAI ? 'bg-neon-violet/5 border-neon-violet/30 shadow-[0_0_15px_rgba(176,38,255,0.05)]' : 'bg-white/5 border-white/5'}`}>
              {transcript.content}
            </p>
          </div>
        ))}

        {Object.entries(interimTranscripts).map(([id, text]) => {
          const isUser = id === userName;
          const isAI = id.toLowerCase().includes('agent') || id.toLowerCase().includes('assistant');
          
          return (
            <div key={`interim-${id}`} className="flex flex-col gap-1 opacity-60 transition-opacity">
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isAI ? 'text-neon-violet' : 'text-aurora-teal'}`}>
                {isAI ? 'Agentic AI' : isUser ? 'You' : id} (typing...)
              </span>
              <p className="text-sm text-chalk-white/50 italic leading-relaxed px-3 border-l-2 border-white/10">
                {text}
              </p>
            </div>
          );
        })}
        
        {transcripts.length === 0 && Object.keys(interimTranscripts).length === 0 && (
          <div className="flex flex-col items-center justify-center p-8 opacity-20 text-center">
            <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            <p className="text-[10px] uppercase tracking-widest font-bold">Speak now...</p>
          </div>
        )}
      </div>
      
      <div className="mt-2 pt-4 border-t border-white/5">
        <Link
          href={`/meeting/${meetingId}/transcripts`}
          className="group flex items-center justify-between px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-300"
        >
          <span className="text-xs font-bold text-chalk-white/80 group-hover:text-chalk-white">Session Archive</span>
          <svg className="w-4 h-4 text-chalk-white/30 group-hover:text-aurora-teal transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}