"use client";

import { useRouter } from "next/navigation";
import { useEffect, use } from "react";
import { MeetingRoom } from "@/components/MeetingRoom";
import { useSession } from "@/lib/auth-client";

export default function MeetingPage({ params }: { params: Promise<{ id: string }> }) {
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
    <main className="h-screen w-screen overflow-hidden">
        <MeetingRoom 
            roomName={id} 
            userName={session.user.name || "Anonymous User"} 
        />
    </main>
  );
}
