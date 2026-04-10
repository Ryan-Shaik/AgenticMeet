import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from "dotenv";
dotenv.config();

async function testGemini() {
    const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    console.log("Using API Key:", key ? "FOUND" : "MISSING");
    
    if (!key) return;

    try {
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        console.log("Response:", response.text());
    } catch (err: any) {
        console.error("Gemini Error:", err.message);
    }
}

testGemini();
