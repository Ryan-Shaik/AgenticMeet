import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { meetingAnalytics, meetings, transcripts } from "@/db/schema";
import { eq, desc, asc } from "drizzle-orm";
import { calculateMeetingAnalytics, calculateEngagement } from "@/lib/ai/analytics";

export async function POST(req: NextRequest) {
  try {
    const { meetingId } = await req.json();
    const apiKey = req.headers.get("x-api-key");
    const secret = process.env.INTERNAL_API_SECRET || "dev-secret-key";

    if (apiKey !== secret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!meetingId) {
      return NextResponse.json({ error: "Meeting ID is required" }, { status: 400 });
    }

    console.log(`[Analytics] Calculating analytics for meeting: ${meetingId}`);

    const analytics = await calculateMeetingAnalytics(meetingId);
    
    if (!analytics) {
      return NextResponse.json({ error: "No transcripts found" }, { status: 404 });
    }

    console.log(`[Analytics] Analytics calculated for meeting: ${meetingId}`);
    
    return NextResponse.json({
      success: true,
      meetingId,
      analytics
    });
  } catch (error) {
    console.error("[Analytics] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const meetingId = searchParams.get("meetingId");

    if (!meetingId) {
      return NextResponse.json({ error: "Meeting ID is required" }, { status: 400 });
    }

    const meeting = await db
      .select()
      .from(meetings)
      .where(eq(meetings.id, meetingId))
      .then(rows => rows[0]);

    if (!meeting) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    const allAnalytics = await db
      .select()
      .from(meetingAnalytics)
      .where(eq(meetingAnalytics.meetingId, meetingId))
      .orderBy(desc(meetingAnalytics.wordCount));

    const analytics = allAnalytics.filter(a => 
      !a.speakerName?.toLowerCase().includes('agent') && 
      !a.speakerName?.toLowerCase().includes('ai') &&
      !a.speakerName?.toLowerCase().includes('assistant')
    );

    const uniqueSpeakers = new Set(analytics.map(a => a.speakerName));
    const speakerCount = uniqueSpeakers.size;

    const totalTalkTime = analytics.reduce((sum, a) => sum + a.talkTimeMs, 0);
    const totalWords = analytics.reduce((sum, a) => sum + a.wordCount, 0);
    const totalTurns = analytics.reduce((sum, a) => sum + a.speakingTurns, 0);

    const meetingTranscripts = await db
      .select()
      .from(transcripts)
      .where(eq(transcripts.meetingId, meetingId))
      .orderBy(asc(transcripts.timestamp));
    
    const humanTranscripts = meetingTranscripts.filter(t => 
      !t.speakerName?.toLowerCase().includes('agent') && 
      !t.speakerName?.toLowerCase().includes('ai') &&
      !t.speakerName?.toLowerCase().includes('assistant')
    );
    
    const speakerStatsMap = new Map<string, { wordCount: number; speakingTurns: number }>();
    for (const t of humanTranscripts) {
      const name = t.speakerName || "Unknown";
      const existing = speakerStatsMap.get(name) || { wordCount: 0, speakingTurns: 0 };
      speakerStatsMap.set(name, {
        wordCount: existing.wordCount + (t.content?.split(/\s+/).filter(w => w.length > 0).length || 0),
        speakingTurns: existing.speakingTurns + 1
      });
    }
    const speakerStatsArray = Array.from(speakerStatsMap.values());
    const overallEngagement = calculateEngagement(speakerStatsArray as any);

    return NextResponse.json({
      meetingId,
      meetingTitle: meeting.title,
      meetingDate: meeting.createdAt,
      analytics: {
        speakers: analytics,
        summary: {
          totalTalkTimeMs: totalTalkTime,
          totalWords,
          totalSpeakingTurns: totalTurns,
          speakerCount: speakerCount,
          overallEngagementScore: overallEngagement,
          overallSentiment: "neutral"
        }
      }
    });
  } catch (error) {
    console.error("[Analytics] GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}