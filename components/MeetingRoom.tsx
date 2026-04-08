"use client";

import {
  ControlBar,
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useTracks,
  AudioVisualizer,
  BarVisualizer,
  useVoiceAssistant,
  DisconnectButton,
  LayoutContextProvider,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToken } from "@/hooks/useToken";

interface MeetingRoomProps {
  roomName: string;
  userName: string;
}

export function MeetingRoom({ roomName, userName }: MeetingRoomProps) {
  const { token, getToken, isLoading, error } = useToken();
  const router = useRouter();

  useEffect(() => {
    getToken(roomName, userName);
  }, [roomName, userName, getToken]);

  if (isLoading) return <div className="flex items-center justify-center h-screen bg-obsidian-black text-chalk-white">Connecting to AgenticMeet...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (!token) return <div className="text-chalk-white">Generating secure session...</div>;

  return (
    <LiveKitRoom
      video={true}
      audio={true}
      token={token}
      serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
      data-lk-theme="default"
      style={{ height: "100dvh" }}
      onDisconnected={() => router.push("/dashboard")}
    >
      <LayoutContextProvider>
        <div className="flex flex-col md:flex-row h-full bg-obsidian-black bg-grid relative overflow-hidden">
          {/* Main Video Area */}
          <div className="flex-1 p-4 relative z-10">
            <MyVideoConference />
          </div>

          {/* AI Sidebar */}
          <aside className="w-full md:w-80 glass border-l border-white/10 p-6 flex flex-col gap-6 z-20">
            <div className="flex items-center gap-3">
               <div className="w-3 h-3 rounded-full bg-aurora-teal animate-pulse shadow-[0_0_8px_#00F0FF]" />
               <h3 className="font-bold text-lg tracking-tight text-chalk-white">Agentic AI</h3>
            </div>

            <AgentStateView />

            <div className="mt-auto grid grid-cols-1 gap-3 pt-6 border-t border-white/5">
               <ControlBar 
                 variation="minimal" 
                 controls={{ microphone: true, camera: true, screenShare: false, settings: true }} 
               />
               <DisconnectButton className="lk-button !bg-red-500/20 !text-red-500 hover:!bg-red-500 hover:!text-white border border-red-500/30 transition-all font-bold mt-2">
                 End Session
               </DisconnectButton>
            </div>
          </aside>
        </div>
        <RoomAudioRenderer />
      </LayoutContextProvider>
    </LiveKitRoom>
  );
}

function AgentStateView() {
  const { state, audioTrack, agent } = useVoiceAssistant();
  
  return (
    <div className="glass-card rounded-2xl p-6 flex-1 flex flex-col items-center justify-center gap-4 border-neon-violet/30 overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-neon-violet/5 to-transparent pointer-events-none" />
      <div className="w-32 h-32 rounded-full bg-neon-violet/10 flex items-center justify-center relative z-10 transition-transform group-hover:scale-105">
        <div className="w-24 h-24 rounded-full bg-obsidian-black border border-neon-violet/40 shadow-[0_0_20px_rgba(176,38,255,0.3)] flex items-center justify-center">
          <span className="text-neon-violet font-bold text-4xl font-serif">
            {state === 'speaking' ? (
              <div className="flex items-center gap-1">
                <div className="w-1 h-3 bg-neon-violet animate-bounce [animation-delay:-0.3s]" />
                <div className="w-1 h-5 bg-neon-violet animate-bounce [animation-delay:-0.15s]" />
                <div className="w-1 h-3 bg-neon-violet animate-bounce" />
              </div>
            ) : 'A'}
          </span>
        </div>
      </div>
      
      {/* Real LiveKit Visualizer */}
      <div className="h-16 w-full flex items-center justify-center">
        {audioTrack ? (
          <BarVisualizer 
            trackRef={audioTrack} 
            barCount={7} 
            className="h-full w-full"
          />
        ) : (
          <div className="text-chalk-white/20 text-[10px] uppercase tracking-widest">No Audio Detected</div>
        )}
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-chalk-white/90">
          {agent ? "Assistant is Online" : "Waiting for Assistant..."}
        </p>
        <p className="text-[10px] uppercase tracking-widest text-aurora-teal/70 font-bold mt-1">
          {state === 'speaking' ? 'Speaking...' : state === 'listening' ? 'Listening...' : 'Thinking...'}
        </p>
      </div>
    </div>
  );
}

function MyVideoConference() {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: false },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ]
  );

  return (
    <GridLayout tracks={tracks} style={{ height: "calc(100vh - var(--lk-control-bar-height))" }}>
      <ParticipantTile />
    </GridLayout>
  );
}
