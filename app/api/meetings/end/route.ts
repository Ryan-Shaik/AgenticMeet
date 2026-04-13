import { NextRequest, NextResponse } from "next/server";
import { calculateMeetingAnalytics } from "@/lib/ai/analytics";
import db from "@/db";
import { meetings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { meetingId } = await req.json();

    if (!meetingId) {
      return NextResponse.json({ error: "Meeting ID is required" }, { status: 400 });
    }

    console.log(`[End Meeting] Processing meeting: ${meetingId}`);

    // Update meeting status
    await db.update(meetings)
      .set({ status: "completed" })
      .where(eq(meetings.id, meetingId));

    // Trigger analytics calculation
    const analytics = await calculateMeetingAnalytics(meetingId);
    
    console.log(`[End Meeting] Result for: ${meetingId}`, analytics ? {
      speakers: analytics.speakerStats.length,
      words: analytics.totalWords
    } : "No analytics (no transcripts)");
    
    return NextResponse.json({
      success: true,
      meetingId,
      hasTranscripts: !!analytics,
      analytics: analytics ? {
        totalWords: analytics.totalWords,
        speakerCount: analytics.speakerStats.length,
        engagement: analytics.overallEngagement
      } : null
    });
  } catch (error) {
    console.error("[End Meeting] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}