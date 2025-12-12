import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GOOGLE_API_KEY;

if (!apiKey) {
  throw new Error("Missing GOOGLE_API_KEY in environment variables.");
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.0-flash",
});

// Base reusable function
async function askGemini(prompt: string) {
  try {
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API error:", error);
    return "Error generating response.";
  }
}

/* ============================================
   EXPORTS USED BY ANY OF YOUR COMPONENTS
============================================ */

// 1. Used by AiAssistant.tsx
export async function getChatResponse(message: string) {
  return askGemini(message);
}

// 2. Used by DashboardView.tsx
export async function generateMarketStrategy(data: string) {
  return askGemini(`Generate a market strategy:\n${data}`);
}

// 3. Used by NewsAnalysisView.tsx
export async function analyzeNewsImpact(news: string) {
  return askGemini(`Analyze the stock market impact of this news:\n${news}`);
}

// 4. General purpose
export async function generateGeminiResponse(prompt: string) {
  return askGemini(prompt);
}

// 5. Future-proof (if any component calls these)
export async function summarizeText(text: string) {
  return askGemini(`Summarize this:\n${text}`);
}

export async function predictStockMovement(text: string) {
  return askGemini(`Predict stock price impact:\n${text}`);
}

