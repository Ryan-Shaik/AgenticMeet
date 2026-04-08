"use client";

import { use } from "react";
import { MeetingRoom } from "@/components/MeetingRoom";
import { useSession } from "@/lib/auth-client";
import { redirect } from "next/navigation";

export default function MeetingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session, isPending } = useSession();

  if (isPending) return <div className="flex items-center justify-center h-screen bg-obsidian-black text-chalk-white font-sans animate-pulse">Authenticating Session...</div>;
  
  if (!session) {
    return redirect("/login");
  }

  return (
    <main className="h-screen w-screen overflow-hidden">
        <MeetingRoom 
            roomName={id} 
            userName={session.user.name || "Anonymous User"} 
        />
    </main>
  );
}
