import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { transcripts, meetings } from "@/db/schema";
import { desc, eq, like, or, sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const meetingId = searchParams.get("meetingId");
    const search = searchParams.get("search") || "";
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    let allTranscripts = await db
      .select({
        id: transcripts.id,
        meetingId: transcripts.meetingId,
        meetingTitle: meetings.title,
        speakerName: transcripts.speakerName,
        content: transcripts.content,
        timestamp: transcripts.timestamp,
      })
      .from(transcripts)
      .leftJoin(meetings, eq(transcripts.meetingId, meetings.id))
      .orderBy(desc(transcripts.timestamp))
      .limit(500);

    
    let results = allTranscripts;

    if (meetingId) {
      results = results.filter(t => t.meetingId === meetingId);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      results = results.filter(t => 
        t.content?.toLowerCase().includes(searchLower) ||
        t.speakerName?.toLowerCase().includes(searchLower) ||
        t.meetingTitle?.toLowerCase().includes(searchLower)
      );
    }

    if (dateFrom) {
      results = results.filter(t => new Date(t.timestamp) >= new Date(dateFrom));
    }

    if (dateTo) {
      results = results.filter(t => new Date(t.timestamp) <= new Date(dateTo + "T23:59:59"));
    }

    return NextResponse.json({ 
      transcripts: results,
      count: results.length 
    });
  } catch (error) {
    console.error("[Search] Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}