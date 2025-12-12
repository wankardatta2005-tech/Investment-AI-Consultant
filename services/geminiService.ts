import { GoogleGenAI, Chat } from "@google/genai";
import { NewsItem } from "../types";

// Initialize Gemini
// Note: In a real production app, ensure API_KEY is strictly server-side or proxied.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const analyzeNewsImpact = async (newsItem: NewsItem): Promise<string> => {
  if (!process.env.API_KEY) {
    return "API Key not configured. Using simulated analysis: This event likely has a moderate impact on the sector due to prevailing market conditions.";
  }

  try {
    const prompt = `
      Analyze the following financial news item as a senior market analyst.
      Title: ${newsItem.title}
      Source: ${newsItem.source}
      Summary: ${newsItem.summary}
      Region: ${newsItem.region}

      Provide a concise (max 3 sentences) analysis of the immediate market impact, specifically identifying which sectors are most affected and the suggested trading stance (Buy/Sell/Wait) for related assets.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Analysis unavailable.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Failed to generate analysis. Please try again later.";
  }
};

export const generateMarketStrategy = async (stocks: string[]): Promise<string> => {
  if (!process.env.API_KEY) {
    return "Simulated Strategy: Accumulate technology stocks on dips. Maintain defensive positions in healthcare.";
  }

  try {
    const prompt = `
      Given the current simulated portfolio focusing on: ${stocks.join(', ')}.
      Act as an algorithmic trading strategist. Provide a high-level strategic outlook for the next trading session.
      Focus on risk management and potential entry points. Limit response to 50 words.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Strategy generation failed.";
  } catch (error) {
    console.error("Strategy Gen Error:", error);
    return "Unable to generate strategy at this time.";
  }
};

let chatSession: Chat | null = null;

export const getChatResponse = async (message: string): Promise<string> => {
  if (!process.env.API_KEY) {
    return "I am the QuantAI Co-Pilot. Please configure your API Key to enable live chatting. Since I am in demo mode, I suggest focusing on risk management today.";
  }

  try {
    if (!chatSession) {
      chatSession = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: 'You are an advanced AI Trading Co-Pilot for the QuantAI platform. Your goal is to help users interpret market signals, understand news sentiment, and refine their algorithmic strategies. Be concise, professional, and data-driven. Do not give financial advice, but rather "market analysis" and "educational insights".',
        },
      });
    }

    const response = await chatSession.sendMessage({ message });
    return response.text || "I couldn't process that request.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "Sorry, I'm having trouble connecting to the market brain right now.";
  }
};