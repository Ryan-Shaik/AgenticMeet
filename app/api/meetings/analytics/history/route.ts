import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import db from "@/db";
import { meetingAnalytics, summaries, meetings } from "@/db/schema";
import { desc, sql, eq, and } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    // Get all meetings that have analytics, ordered by meeting creation date (newest first)
    const analytics = await db
      .select({
        meetingId: meetingAnalytics.meetingId,
        meetingDate: meetings.createdAt,
        totalTalkTime: sql`sum(${meetingAnalytics.talkTimeMs})`,
        totalWords: sql`sum(${meetingAnalytics.wordCount})`,
        engagement: sql`avg(${meetingAnalytics.engagementScore})`,
      })
      .from(meetingAnalytics)
      .innerJoin(meetings, eq(meetings.id, meetingAnalytics.meetingId))
      .groupBy(meetingAnalytics.meetingId, meetings.createdAt)
      .orderBy(desc(meetings.createdAt))
      .limit(20);

    // Filter and count unique human speakers in code
    const history = [];
    for (const a of analytics) {
      const speakers = await db
        .select({ speakerName: meetingAnalytics.speakerName })
        .from(meetingAnalytics)
        .where(eq(meetingAnalytics.meetingId, a.meetingId));
      
      const uniqueHumans = new Set(
        speakers
          .map(s => s.speakerName?.trim() || "")
          .filter(name => !name?.toLowerCase().includes('agent') && !name?.toLowerCase().includes('assistant'))
      );

      const summary = await db
        .select({ sentiment: summaries.sentiment })
        .from(summaries)
        .where(eq(summaries.meetingId, a.meetingId))
        .then(rows => rows[0]);
      
      history.push({
        meetingId: a.meetingId,
        meetingDate: a.meetingDate,
        speakerCount: uniqueHumans.size,
        totalTalkTimeMs: Number(a.totalTalkTime || 0),
        totalWords: Number(a.totalWords || 0),
        avgEngagementScore: Math.round(Number(a.engagement || 0)),
        sentiment: summary?.sentiment || null,
      });
    }

    return NextResponse.json({ history });
  } catch (error) {
    console.error("[Analytics History] Error:", error);
    return NextResponse.json({ history: [], error: "Failed to fetch" }, { status: 500 });
  }
}