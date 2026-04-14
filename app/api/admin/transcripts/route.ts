import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import db from "@/db";
import { transcripts, meetings } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const meetingId = searchParams.get("meetingId");

    if (meetingId) {
      const meetingTranscripts = await db
        .select()
        .from(transcripts)
        .where(eq(transcripts.meetingId, meetingId))
        .orderBy(desc(transcripts.timestamp));

      return NextResponse.json({ 
        meetingId,
        count: meetingTranscripts.length,
        transcripts: meetingTranscripts 
      });
    }

    // Get all recent meetings with transcript counts
    const results = await db
      .select({
        meetingId: transcripts.meetingId,
        count: sql<number>`count(*)`,
        latest: sql`max(${transcripts.createdAt})`,
      })
      .from(transcripts)
      .groupBy(transcripts.meetingId)
      .orderBy(desc(sql`max(${transcripts.createdAt})`))
      .limit(20);

    return NextResponse.json({ allMeetings: results });
  } catch (error) {
    console.error("[Transcripts Check] Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}