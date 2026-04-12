import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

const SYSTEM_PROMPT = `You are the AgenticMeet AI Assistant. Provide helpful, brief responses.`;

export async function generateAIResponse({ transcript, lastSpeaker }: { transcript: string; lastSpeaker: string }): Promise<string | null> {
  try {
    const result = await model.generateContent([
      { text: SYSTEM_PROMPT },
      { text: `Last speaker: ${lastSpeaker}. Say something brief and helpful.` }
    ]);
    
    const response = result.response.text().trim();
    if (response.length < 5) return null;
    return response;

  } catch (error: any) {
    console.error("[AI Response] Error:", error?.message || error);
    return null;
  }
}