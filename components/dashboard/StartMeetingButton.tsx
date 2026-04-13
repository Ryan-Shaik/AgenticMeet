"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function StartMeetingButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleStartMeeting = async () => {
    setIsLoading(true);
    try {
      // Generate a unique room ID
      const roomId = `meeting-${Math.random().toString(36).substring(2, 9)}`;
      
      // Register the meeting in the database first
      const resp = await fetch("/api/meetings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          id: roomId,
          title: `Executive Briefing ${new Date().toLocaleDateString()}` 
        }),
      });

      if (!resp.ok) throw new Error("Failed to initialize meeting record");

      // Redirect to the meeting page
      router.push(`/meeting/${roomId}`);
    } catch (err) {
      console.error(err);
      alert("System Error: Could not start meeting. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="neon" 
      className="w-full relative overflow-hidden group" 
      onClick={handleStartMeeting}
      disabled={isLoading}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Plus size={18} className="mr-2 group-hover:rotate-90 transition-transform" />
      )}
      {isLoading ? "Preparing Room..." : "Start Meeting with AI Agent"}
      
      {/* Decorative pulse effect */}
      {!isLoading && (
        <span className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500 ease-out pointer-events-none opacity-10" />
      )}
    </Button>
  );
}
