import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import db from "@/db";
import { meetingAnalytics, meetings, summaries } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { calculateMeetingAnalytics } from "@/lib/ai/analytics";

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

    const summary = await db
      .select()
      .from(summaries)
      .where(eq(summaries.meetingId, meetingId))
      .then(rows => rows[0]);

    const allAnalytics = await db
      .select()
      .from(meetingAnalytics)
      .where(eq(meetingAnalytics.meetingId, meetingId))
      .orderBy(desc(meetingAnalytics.wordCount));

    // Filter out AI speakers in code
    const analytics = allAnalytics.filter(a => 
      !a.speakerName?.toLowerCase().includes('agent') && 
      !a.speakerName?.toLowerCase().includes('assistant')
    );

    // Count unique speakers
    const uniqueSpeakers = new Set(analytics.map(a => a.speakerName));
    const speakerCount = uniqueSpeakers.size;

    const totalTalkTime = analytics.reduce((sum, a) => sum + a.talkTimeMs, 0);
    const totalWords = analytics.reduce((sum, a) => sum + a.wordCount, 0);
    const totalTurns = analytics.reduce((sum, a) => sum + a.speakingTurns, 0);
    const avgEngagement = analytics.length > 0
      ? analytics.reduce((sum, a) => sum + (a.engagementScore || 0), 0) / analytics.length
      : 0;

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
          avgEngagementScore: Math.round(avgEngagement),
          overallSentiment: summary?.sentiment || "neutral"
        }
      }
    });
  } catch (error) {
    console.error("[Analytics] GET Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}