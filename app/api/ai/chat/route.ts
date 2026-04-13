import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { transcripts, meetings } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { generateAIResponse } from "@/lib/ai/response";
import { checkAccess } from "@/lib/subscription";

export async function POST(req: NextRequest) {
  try {
    const { meetingId, lastSpeaker: providedLastSpeaker } = await req.json();

    if (!meetingId) {
      return NextResponse.json({ error: "Meeting ID required" }, { status: 400 });
    }

    // Identify the host of the meeting
    const meetingRecord = await db.select().from(meetings).where(eq(meetings.id, meetingId)).then(r => r[0]);
    if (!meetingRecord) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Enforce Module 1/2 limits for AI usage
    if (meetingRecord.hostId) {
      const access = await checkAccess(meetingRecord.hostId, "ai");
      if (!access.allowed) {
        return NextResponse.json({ error: access.reason || "AI interaction limit exceeded" }, { status: 403 });
      }
    }


    const meetingTranscripts = await db
      .select()
      .from(transcripts)
      .where(eq(transcripts.meetingId, meetingId))
      .orderBy(desc(transcripts.timestamp))
      .limit(20);

    if (meetingTranscripts.length === 0) {
      return NextResponse.json({ error: "No transcripts" }, { status: 404 });
    }

    const recentTranscript = meetingTranscripts.map(t => `${t.speakerName}: ${t.content}`).join("\n");
    const lastSpeaker = providedLastSpeaker || meetingTranscripts[0]?.speakerName || "Unknown";

    const response = await generateAIResponse({
      transcript: recentTranscript,
      lastSpeaker
    });

    if (!response) {
      return NextResponse.json({ 
        message: "AI is listening...",
        shouldSpeak: false 
      });
    }

    return NextResponse.json({
      message: response,
      shouldSpeak: true,
      lastSpeaker
    });
  } catch (error) {
    console.error("[AI Chat] Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}