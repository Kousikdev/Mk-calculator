import { GoogleGenAI } from "@google/genai";

export const geminiService = {
  // Complex reasoning/chat with Thinking Mode
  async chatWithThinking(prompt: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          thinkingConfig: { thinkingBudget: 32768 }
        },
      });
      return response.text || "I couldn't generate a response.";
    } catch (error) {
      console.error("Thinking chat error:", error);
      return "An error occurred during reasoning.";
    }
  },

  // Fast AI responses for simple queries
  async fastResponse(prompt: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
      });
      return response.text || "";
    } catch (error) {
      console.error("Fast response error:", error);
      return "Sorry, I encountered an error. Please try again.";
    }
  },

  // Analyze math problems from images
  async analyzeMathImage(base64Image: string): Promise<string> {
    const cleanBase64 = base64Image.includes(',') ? base64Image.split(',')[1] : base64Image;
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: {
          parts: [
            { inlineData: { data: cleanBase64, mimeType: 'image/png' } },
            { text: "Solve this math problem. Show steps and the final answer clearly." }
          ]
        }
      });
      return response.text || "Could not recognize problem.";
    } catch (error) {
      console.error("Image analysis error:", error);
      return "Failed to analyze image. Please ensure the image is clear.";
    }
  },

  // Search Grounding for current exchange rates or news
  async searchMarketInfo(query: string): Promise<{ text: string; sources: any[] }> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: [{ parts: [{ text: query }] }],
        config: {
          tools: [{ googleSearch: {} }]
        }
      });
      return {
        text: response.text || "",
        sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
      };
    } catch (error) {
      console.error("Search grounding error:", error);
      return { text: "Error fetching live market data.", sources: [] };
    }
  }
};