import { GoogleGenerativeAI } from "@google/generative-ai";
import { db } from "@/db";
import { transcripts } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;

if (!apiKey) {
    console.error("[Summarizer] Missing API Key. Set GEMINI_API_KEY or GOOGLE_API_KEY.");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export async function generateMeetingSummary(meetingId: string) {
  try {
    console.log(`[Summarizer] Fetching transcripts for: ${meetingId}`);
    // 1. Fetch all transcripts for the meeting
    const transcriptData = await db
      .select()
      .from(transcripts)
      .where(eq(transcripts.meetingId, meetingId))
      .orderBy(asc(transcripts.timestamp));

    if (transcriptData.length === 0) {
      console.log(`[Summarizer] No transcripts found for meeting: ${meetingId}`);
      return null;
    }

    // 2. Format transcripts for the prompt
    const fullTranscript = transcriptData
      .map((t) => `${t.speakerName || "Unknown"}: ${t.content}`)
      .join("\n");

    // 3. Prepare the prompt
    const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        generationConfig: {
            responseMimeType: "application/json",
        }
    });

    const prompt = `
      You are an expert business analyst and meeting assistant. 
      Your task is to analyze the following meeting transcript and generate a structured summary in JSON format.
      
      The summary must include:
      - executiveSummary: A high-level overview of the meeting (2-3 sentences).
      - topics: An array of 3-5 major themes discussed. Each topic must have a 'title' and an array of 'points'.
      - actionItems: An array of specific tasks mentioned. Each item must have a 'task' and an optional 'assignee'.
      - decisions: An array of strings representing conclusions or agreements reached.
      - sentiment: The overall mood of the meeting (e.g., Collaborative, Urgent, Tense, Productive).

      Return ONLY a valid JSON object following this schema:
      {
        "executiveSummary": string,
        "topics": [{ "title": string, "points": string[] }],
        "actionItems": [{ "task": string, "assignee": string }],
        "decisions": string[],
        "sentiment": string
      }

      TRANSCRIPT:
      ${fullTranscript}
    `;

    // 4. Generate the summary
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const summaryJson = JSON.parse(text);
      console.log(`[Summarizer] Successfully generated summary for: ${meetingId}`);
      return summaryJson;
    } catch (apiError: any) {
      // Handle Quota Exceeded (429) or other API errors with a content-aware fallback
      if (apiError.message?.includes("429") || apiError.message?.includes("quota")) {
        console.warn("[Summarizer] Quota exceeded. Generating content-aware fallback summary.");
        
        // Basic Heuristic Summary from actual transcript
        const participantNames = Array.from(new Set(transcriptData.map(t => t.speakerName || "Participant")));
        const firstFewLines = transcriptData.slice(0, 3).map(t => t.content).join(" ");
        const keySentences = transcriptData.filter(t => t.content.length > 30).slice(-3).map(t => t.content);

        return {
          executiveSummary: `This meeting involved ${participantNames.join(", ")}. Primary discussion points included: ${firstFewLines.substring(0, 150)}... (Generated via Content-Aware Fallback due to AI Quota)`,
          topics: [
            { 
              title: "General Discussion", 
              points: transcriptData.slice(0, 5).map(t => `${t.speakerName}: ${t.content.substring(0, 50)}...`) 
            },
            {
              title: "Key Metrics & Mentions",
              points: transcriptData.filter(t => /\$|%|cost|revenue|budget/i.test(t.content)).slice(0, 3).map(t => t.content)
            }
          ],
          actionItems: participantNames.slice(0, 2).map((name, i) => ({
             task: `Follow up on points discussed in the latter half of the meeting.`,
             assignee: name
          })),
          decisions: keySentences.length > 0 ? keySentences : ["Participants agreed to move forward with the discussed points."],
          sentiment: "Productive (Heuristic)"
        };
      }
      throw apiError;
    }
  } catch (error) {
    console.error("[Summarizer] Error generating summary:", error);
    throw error;
  }
}
