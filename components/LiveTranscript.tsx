'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Transcript {
  id: string;
  speakerName: string;
  content: string;
  timestamp: Date;
}

interface LiveTranscriptProps {
  meetingId: string;
}

export function LiveTranscript({ meetingId }: LiveTranscriptProps) {
  const [speakerName, setSpeakerName] = useState('You');
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (transcriptContainerRef.current) {
      transcriptContainerRef.current.scrollTop = 0;
    }
  }, [transcripts, currentText]);

  const startRecording = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    try {
      wsRef.current = new WebSocket('ws://localhost:5001');

      await new Promise<void>((resolve, reject) => {
        if (!wsRef.current) return reject(new Error('No WebSocket'));
        
        wsRef.current.onopen = () => {
          setIsWebSocketConnected(true);
          wsRef.current?.send(JSON.stringify({
            type: 'join',
            meetingId: meetingId,
            speakerName: speakerName
          }));
          resolve();
        };

        wsRef.current.onerror = () => reject(new Error('WebSocket error'));
        wsRef.current.onclose = () => setIsWebSocketConnected(false);

        wsRef.current.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'joined') {
              console.log('Joined meeting:', data.meetingId);
            } else if (data.type === 'transcription') {
              if (data.speaker !== speakerName) {
                const newTranscript: Transcript = {
                  id: crypto.randomUUID(),
                  speakerName: data.speaker,
                  content: data.text,
                  timestamp: new Date(data.timestamp || Date.now()),
                };
                setTranscripts(prev => [newTranscript, ...prev]);
                
                fetch('/api/transcription', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    meetingId: data.meetingId,
                    speakerName: data.speaker,
                    content: data.text,
                  }),
                }).catch(console.error);
              }
            } else if (data.type === 'user_left') {
              console.log('User left:', data.speaker);
            }
          } catch (err) {
            console.error('Error parsing message:', err);
          }
        };
      });

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (interimTranscript) {
          setCurrentText(prev => prev + interimTranscript);
        }

        if (finalTranscript) {
          setCurrentText(finalTranscript);
          
          if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: 'transcription',
              text: finalTranscript,
              speaker: speakerName,
              meetingId: meetingId,
              timestamp: new Date().toISOString()
            }));
          }

          const newTranscript: Transcript = {
            id: crypto.randomUUID(),
            speakerName: speakerName,
            content: finalTranscript,
            timestamp: new Date(),
          };
          
          setTranscripts(prev => [newTranscript, ...prev]);
          
          fetch('/api/transcription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              meetingId,
              speakerName: speakerName,
              content: finalTranscript,
            }),
          }).catch(console.error);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start recording:', err);
      setError('Failed to start recording');
    }
  }, [meetingId, speakerName]);

  useEffect(() => {
    startRecording();
  }, []);

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-600 rounded text-red-200 text-sm">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-sm text-gray-400 mb-1">Your Name</label>
        <input
          type="text"
          value={speakerName}
          onChange={(e) => setSpeakerName(e.target.value)}
          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Live Transcript</h2>
        {isWebSocketConnected ? (
          <span className="text-xs text-green-400 flex items-center gap-1">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            Live
          </span>
        ) : (
          <span className="text-xs text-yellow-400 flex items-center gap-1">
            <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
            Connecting...
          </span>
        )}
      </div>
      
      <div ref={transcriptContainerRef} className="space-y-3 max-h-96 overflow-y-auto">
        {transcripts.map((transcript) => (
          <div key={transcript.id} className="bg-gray-700 rounded p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-blue-400">
                {transcript.speakerName}:
              </span>
              <span className="text-xs text-gray-400">
                [{transcript.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}]
              </span>
            </div>
            <p className="text-white">{transcript.content}</p>
          </div>
        ))}
        
        {currentText && (
          <div className="bg-gray-700 rounded p-3">
            <p className="text-gray-300 italic">{currentText}</p>
          </div>
        )}
        
        {transcripts.length === 0 && !currentText && (
          <p className="text-gray-500 text-center py-8">
            Waiting for speech...
          </p>
        )}
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-700">
        <Link
          href={`/meeting/${meetingId}/transcripts`}
          className="block w-full text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors"
        >
          View Saved Transcripts
        </Link>
      </div>
    </div>
  );
}