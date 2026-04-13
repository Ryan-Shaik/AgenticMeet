import { NextResponse } from "next/server";
import { db } from "@/db";
import { meetings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateMeetingSummary } from "@/lib/ai/summarizer";
import { summaries } from "@/db/schema";
import { checkAccess } from "@/lib/subscription";

export async function POST(req: Request) {
  let meetingId: string = 'unknown';
  try {
    const body = await req.json();
    meetingId = body.meetingId;
    const apiKey = req.headers.get("x-api-key");
    const secret = process.env.INTERNAL_API_SECRET || "dev-secret-key";

    if (apiKey !== secret) {
        console.warn(`[Summarize] Unauthorized request attempt for ${meetingId}`);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!meetingId) {
      return NextResponse.json({ error: "Meeting ID is required" }, { status: 400 });
    }

    const meetingRecord = await db.select().from(meetings).where(eq(meetings.id, meetingId)).then(r => r[0]);
    if (!meetingRecord) {
      return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
    }

    // Enforce Module 1/2 AI limits before running heavy summarization pipeline
    if (meetingRecord.hostId) {
      const access = await checkAccess(meetingRecord.hostId, "ai");
      if (!access.allowed) {
        console.warn(`[Summarize] Blocked AI summary generation for meeting ${meetingId}. Reason: ${access.reason}`);
        return NextResponse.json({ error: access.reason || "AI interaction limit exceeded" }, { status: 403 });
      }
    }

    console.log(`[Summarize] Starting summary generation for meeting: ${meetingId}`);

    // Wait 2 seconds for all pending transcripts to flush to DB
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Phase 2: Call the Gemini intelligence engine
    const summary = await generateMeetingSummary(meetingId);
    
    if (!summary) {
        return NextResponse.json({ error: "Failed to generate summary or no transcripts found" }, { status: 404 });
    }

    // Phase 3: Persistence
    const summaryId = crypto.randomUUID();
    await db.insert(summaries).values({
        id: summaryId,
        meetingId: meetingId,
        executiveSummary: summary.executiveSummary,
        topics: summary.topics,
        actionItems: summary.actionItems,
        decisions: summary.decisions,
        sentiment: summary.sentiment,
    });

    // Update meeting status to completed
    await db.update(meetings)
      .set({ status: "completed" })
      .where(eq(meetings.id, meetingId));

    console.log(`[Summarize] Summary persisted successfully with ID: ${summaryId}`);
    
    return NextResponse.json({ 
      success: true, 
      message: "Summary generated and saved successfully",
      meetingId,
      summaryId,
      summary
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error ? error.stack : undefined;
    console.error("[Summarize] Error details:", {
        message,
        stack,
        meetingId
    });
    return NextResponse.json({
        error: "Internal Server Error",
        details: message
    }, { status: 500 });
  }
}
