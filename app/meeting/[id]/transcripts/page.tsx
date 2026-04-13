"use client";

import { useRouter } from "next/navigation";
import { useEffect, use } from "react";
import { useSession } from "@/lib/auth-client";
import { SavedTranscripts } from "@/components/SavedTranscripts";
import { MeetingAnalytics } from "@/components/MeetingAnalytics";

export default function TranscriptsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.replace("/login");
    }
  }, [session, isPending, router]);

  if (isPending || !session) {
    return (
      <div className="flex items-center justify-center h-screen bg-obsidian-black text-chalk-white font-sans animate-pulse">
        Authenticating Session...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-obsidian-black bg-grid p-6">
        <div className="max-w-4xl mx-auto space-y-8">
            <header className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-aurora-teal font-bold">Session History</span>
                    <div className="h-px flex-1 bg-white/5" />
                </div>
                <h1 className="text-3xl font-serif font-bold text-chalk-white tracking-tight">Meeting Archive</h1>
                <p className="text-sm text-chalk-white/40 font-medium">Reviewing session records for <span className="text-chalk-white/60 font-mono">#{id}</span></p>
            </header>

            <MeetingAnalytics meetingId={id} />

            <div className="glass-card rounded-3xl border-white/5 overflow-hidden">
                <SavedTranscripts meetingId={id} />
            </div>
        </div>
    </main>
  );
}