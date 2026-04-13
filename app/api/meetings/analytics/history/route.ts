import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { meetingAnalytics } from "@/db/schema";
import { desc, sql, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const analytics = await db
      .select({
        meetingId: meetingAnalytics.meetingId,
        meetingDate: sql`max(${meetingAnalytics.createdAt})`,
        totalTalkTime: sql`sum(${meetingAnalytics.talkTimeMs})`,
        totalWords: sql`sum(${meetingAnalytics.wordCount})`,
        engagement: sql`avg(${meetingAnalytics.engagementScore})`,
      })
      .from(meetingAnalytics)
      .groupBy(meetingAnalytics.meetingId)
      .orderBy(desc(sql`max(${meetingAnalytics.createdAt})`))
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
          .filter(name => !name?.toLowerCase().includes('agent'))
      );
      
      history.push({
        meetingId: a.meetingId,
        meetingDate: a.meetingDate,
        speakerCount: uniqueHumans.size,
        totalTalkTimeMs: Number(a.totalTalkTime || 0),
        totalWords: Number(a.totalWords || 0),
        avgEngagementScore: Math.round(Number(a.engagement || 0)),
      });
    }

    return NextResponse.json({ history });
  } catch (error) {
    console.error("[Analytics History] Error:", error);
    return NextResponse.json({ history: [], error: "Failed to fetch" }, { status: 500 });
  }
}