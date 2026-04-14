import { NextRequest, NextResponse } from "next/server";
import { calculateMeetingAnalytics } from "@/lib/ai/analytics";
import { generateMeetingSummary } from "@/lib/ai/summarizer";
import db from "@/db";
import { meetings, summaries } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { meetingId } = await req.json();

    if (!meetingId) {
      return NextResponse.json({ error: "Meeting ID is required" }, { status: 400 });
    }

    console.log(`[End Meeting] Processing meeting: ${meetingId}`);

    // 1. Mark meeting as completed
    await db.update(meetings)
      .set({ status: "completed" })
      .where(eq(meetings.id, meetingId));

    // 2. Calculate analytics (runs in parallel with summary generation)
    const [analytics, summary] = await Promise.allSettled([
      calculateMeetingAnalytics(meetingId),
      generateMeetingSummary(meetingId),
    ]);

    const analyticsResult = analytics.status === "fulfilled" ? analytics.value : null;
    const summaryResult = summary.status === "fulfilled" ? summary.value : null;

    if (analytics.status === "rejected") {
      console.error("[End Meeting] Analytics failed:", analytics.reason);
    }
    if (summary.status === "rejected") {
      console.error("[End Meeting] Summary generation failed:", summary.reason);
    }

    // 3. Persist summary if generated
    let summaryId: string | null = null;
    if (summaryResult) {
      summaryId = crypto.randomUUID();
      await db.insert(summaries).values({
        id: summaryId,
        meetingId,
        executiveSummary: summaryResult.executiveSummary,
        topics: summaryResult.topics,
        actionItems: summaryResult.actionItems,
        decisions: summaryResult.decisions,
        sentiment: summaryResult.sentiment,
      });
      console.log(`[End Meeting] Summary saved: ${summaryId}`);
    } else {
      console.warn(`[End Meeting] No summary generated for ${meetingId} (no transcripts or AI error)`);
    }

    console.log(`[End Meeting] Done for: ${meetingId}`, {
      speakers: analyticsResult?.speakerStats?.length ?? 0,
      words: analyticsResult?.totalWords ?? 0,
      summaryId,
    });

    return NextResponse.json({
      success: true,
      meetingId,
      hasTranscripts: !!analyticsResult,
      hasSummary: !!summaryResult,
      summaryId,
      analytics: analyticsResult ? {
        totalWords: analyticsResult.totalWords,
        speakerCount: analyticsResult.speakerStats.length,
        engagement: analyticsResult.overallEngagement,
      } : null,
    });
  } catch (error) {
    console.error("[End Meeting] Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}