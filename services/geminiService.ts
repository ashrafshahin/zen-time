
import { GoogleGenAI, Type } from "@google/genai";
import { Task, WeatherInfo } from "../types";

// Always initialize the client using the named parameter `apiKey`.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const geminiService = {
  async draftEmail(context: string) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are a professional assistant. Draft an email based on this context: "${context}". Return the response as a valid JSON object with "subject" and "body" fields.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              body: { type: Type.STRING }
            },
            propertyOrdering: ["subject", "body"],
            required: ["subject", "body"]
          }
        }
      });
      // Correctly access .text property from GenerateContentResponse
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Gemini Email Draft Error:", error);
      return { subject: "Error generating draft", body: "Please try again later." };
    }
  },

  async getDailyOptimizer(tasks: Task[]) {
    const taskSummary = tasks.map(t => `- ${t.title} (${t.startTime}-${t.endTime}) [${t.priority}]`).join("\n");
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze this daily work schedule and provide 3-4 precise, actionable suggestions to improve productivity or well-being. Focus on deep work blocks and breaks.\n\nSchedule:\n${taskSummary}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            propertyOrdering: ["summary", "suggestions"],
            required: ["summary", "suggestions"]
          }
        }
      });
      // Correctly access .text property from GenerateContentResponse
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Gemini Optimizer Error:", error);
      return { summary: "Could not optimize at this time.", suggestions: [] };
    }
  },

  async getWeatherForZone(zone: string): Promise<WeatherInfo> {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `What is the current weather and local time in ${zone}? Provide the temperature in Celsius and a brief condition description.`,
        config: {
          tools: [{ googleSearch: {} }]
        },
      });

      // Correctly access .text property from GenerateContentResponse
      const text = response.text || "";
      // Extract website URLs from groundingChunks as required by guidelines
      const sourceUrl = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.[0]?.web?.uri;

      // Extract basic info from text (rough parsing since we want natural language from Search)
      const tempMatch = text.match(/(-?\d+)\s*(°C|degrees)/i);
      const temp = tempMatch ? `${tempMatch[1]}°C` : "N/A";
      
      return {
        temp,
        condition: text.length > 50 ? text.substring(0, 50) + "..." : text,
        location: zone,
        sourceUrl
      };
    } catch (error) {
      console.error("Gemini Weather Error:", error);
      return { temp: "--", condition: "Error fetching", location: zone };
    }
  }
};
