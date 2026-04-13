import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { meetingAnalytics } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const analytics = await db
      .select()
      .from(meetingAnalytics)
      .orderBy(desc(meetingAnalytics.createdAt))
      .limit(30);

    return NextResponse.json({ 
      count: analytics.length,
      data: analytics.map(a => ({
        meetingId: a.meetingId,
        speakerName: a.speakerName,
        wordCount: a.wordCount,
        talkTimeMs: a.talkTimeMs
      }))
    });
  } catch (error) {
    console.error("[Debug] Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}