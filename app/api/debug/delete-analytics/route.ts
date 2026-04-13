import { NextRequest, NextResponse } from "next/server";
import db from "@/db";
import { meetingAnalytics } from "@/db/schema";
import { eq, like, or, sql } from "drizzle-orm";

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { meetingId } = body;

    if (!meetingId) {
      return NextResponse.json({ error: "Meeting ID required" }, { status: 400 });
    }

    // Delete all analytics for this meeting
    await db
      .delete(meetingAnalytics)
      .where(eq(meetingAnalytics.meetingId, meetingId));

    return NextResponse.json({ success: true, message: "Deleted analytics for " + meetingId });
  } catch (error) {
    console.error("[Delete] Error:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}