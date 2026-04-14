import { GoogleGenerativeAI } from "@google/generative-ai";
import db from "@/db";
import { transcripts, speakers, meetingAnalytics } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

interface SpeakerStats {
  speakerId: string | null;
  speakerName: string;
  talkTimeMs: number;
  wordCount: number;
  speakingTurns: number;
}

interface MeetingAnalyticsResult {
  meetingId: string;
  totalDuration: number;
  totalWords: number;
  speakerStats: SpeakerStats[];
  overallSentiment: string;
  overallEngagement: number;
}

function calculateTalkTime(transcriptTimestamp: any, nextTimestamp: any): number {
  if (!nextTimestamp) return 3000;
  const diff = new Date(nextTimestamp).getTime() - new Date(transcriptTimestamp).getTime();
  return Math.max(1000, Math.min(diff, 30000));
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

export function calculateEngagement(speakerStats: SpeakerStats[]): number {
  if (speakerStats.length === 0) return 0;
  
  const totalTurns = speakerStats.reduce((sum, s) => sum + s.speakingTurns, 0);
  const totalWords = speakerStats.reduce((sum, s) => sum + s.wordCount, 0);
  const avgWordsPerTurn = totalWords / Math.max(totalTurns, 1);
  const speakerBalance = speakerStats.length > 1 
    ? 1 - (Math.max(...speakerStats.map(s => s.wordCount)) / Math.max(totalWords, 1))
    : 0;
  
  return Math.min(100, Math.round((avgWordsPerTurn * 10 + speakerBalance * 40) / 2));
}

export function calculateIndividualEngagement(
  speakerStat: SpeakerStats,
  allSpeakerStats: SpeakerStats[]
): number {
  if (allSpeakerStats.length === 0) return 0;
  
  const totalWords = allSpeakerStats.reduce((sum, s) => sum + s.wordCount, 0);
  const totalTurns = allSpeakerStats.reduce((sum, s) => sum + s.speakingTurns, 0);
  
  const participationRatio = (speakerStat.wordCount / Math.max(totalWords, 1)) * 100;
  const wordsPerTurn = speakerStat.speakingTurns > 0
    ? (speakerStat.wordCount / speakerStat.speakingTurns)
    : 0;
  const wordsPerTurnScore = Math.min(wordsPerTurn / 2, 50);
  const speakerBalance = allSpeakerStats.length > 1
    ? (1 - (Math.max(...allSpeakerStats.map(s => s.wordCount)) / Math.max(totalWords, 1))) * 100
    : 50;
  
  return Math.min(100, Math.round(
    participationRatio * 0.4 + wordsPerTurnScore + speakerBalance * 0.3
  ));
}

export async function analyzeMeetingSentiment(text: string): Promise<string> {
  // Skip if text is too short
  if (!text || text.length < 10) return "neutral";
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `Analyze the sentiment. Return: positive, neutral, or negative. Transcript: ${text.substring(0, 1000)}`;
    
    const result = await model.generateContent(prompt);
    const response = result.response.text().toLowerCase().trim();
    
    if (response.includes("positive")) return "positive";
    if (response.includes("negative")) return "negative";
    return "neutral";
  } catch (error: any) {
    // If quota exceeded, just return neutral without throwing
    if (error?.status === 429) {
      console.warn("[Analytics] Sentiment skipped (quota exceeded)");
      return "neutral";
    }
    console.error("[Analytics] Sentiment analysis failed:", error);
    return "neutral";
  }
}

export async function calculateMeetingAnalytics(meetingId: string): Promise<MeetingAnalyticsResult | null> {
  try {
    const meetingTranscripts = await db
      .select()
      .from(transcripts)
      .where(eq(transcripts.meetingId, meetingId))
      .orderBy(asc(transcripts.timestamp));

    if (meetingTranscripts.length === 0) {
      return null;
    }

    const speakerMap = new Map<string, SpeakerStats>();
    
    let totalDuration = 0;
    if (meetingTranscripts.length >= 2) {
      const first = new Date(meetingTranscripts[0].timestamp).getTime();
      const last = new Date(meetingTranscripts[meetingTranscripts.length - 1].timestamp).getTime();
      totalDuration = Math.max(0, last - first);
    } else {
      totalDuration = meetingTranscripts.length * 3000;
    }

    for (let i = 0; i < meetingTranscripts.length; i++) {
      const t = meetingTranscripts[i];
      const speakerName = (t.speakerName || "Unknown").trim();
      
      // Skip AI speakers - only count humans
      if (speakerName.toLowerCase().includes('agent') || speakerName.toLowerCase().includes('ai')) {
        continue;
      }
      
      const talkTime = calculateTalkTime(
        t.timestamp,
        i < meetingTranscripts.length - 1 ? meetingTranscripts[i + 1].timestamp : null
      );
      const wordCount = countWords(t.content);

      const existing = speakerMap.get(speakerName) || {
        speakerId: t.speakerId,
        speakerName,
        talkTimeMs: 0,
        wordCount: 0,
        speakingTurns: 0
      };

      speakerMap.set(speakerName, {
        ...existing,
        talkTimeMs: existing.talkTimeMs + talkTime,
        wordCount: existing.wordCount + wordCount,
        speakingTurns: existing.speakingTurns + 1
      });
    }

    const speakerStats = Array.from(speakerMap.values());
    const totalWords = speakerStats.reduce((sum, s) => sum + s.wordCount, 0);
    
    // Only analyze human transcripts for sentiment
    const humanTranscripts = meetingTranscripts.filter(t => 
      !t.speakerName?.toLowerCase().includes('agent') && 
      !t.speakerName?.toLowerCase().includes('ai')
    );
    const overallSentiment = await analyzeMeetingSentiment(
      humanTranscripts.map(t => t.content).join(" ")
    );
    const overallEngagement = calculateEngagement(speakerStats);

    for (const stat of speakerStats) {
      const existing = await db
        .select()
        .from(meetingAnalytics)
        .where(eq(meetingAnalytics.meetingId, meetingId))
        .then(rows => rows.find(r => r.speakerId === stat.speakerId));

      if (existing) {
        await db
          .update(meetingAnalytics)
          .set({
            talkTimeMs: stat.talkTimeMs,
            wordCount: stat.wordCount,
            speakingTurns: stat.speakingTurns,
            engagementScore: calculateIndividualEngagement(stat, speakerStats),
          })
          .where(eq(meetingAnalytics.id, existing.id));
      } else {
        await db.insert(meetingAnalytics).values({
          id: crypto.randomUUID(),
          meetingId,
          speakerId: stat.speakerId,
          speakerName: stat.speakerName,
          talkTimeMs: stat.talkTimeMs,
          wordCount: stat.wordCount,
          speakingTurns: stat.speakingTurns,
          sentimentScore: null,
          engagementScore: calculateIndividualEngagement(stat, speakerStats),
          createdAt: new Date(),
        });
      }
    }

    return {
      meetingId,
      totalDuration,
      totalWords,
      speakerStats,
      overallSentiment,
      overallEngagement
    };
  } catch (error) {
    console.error("[Analytics] Calculation failed:", error);
    return null;
  }
}