
import { GoogleGenAI, Type } from "@google/genai";

// Ensure the application doesn't crash if API_KEY is missing during build/deploy
const API_KEY = process.env.API_KEY || "";

export const getFleetInsights = async (fleetData: any) => {
  if (!API_KEY) {
    console.warn("Gemini API Key is missing. AI insights will be disabled.");
    return {
      summary: "AI analysis is currently unavailable. Please configure your API key.",
      warnings: ["Missing API configuration"],
      recommendations: []
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze this fleet data and provide strategic recommendations for a logistics manager. 
      Focus on: underperforming trucks, high-cost routes, and maintenance risks.
      Data: ${JSON.stringify(fleetData)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            warnings: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            recommendations: { 
              type: Type.ARRAY, 
              items: { 
                type: Type.OBJECT,
                properties: {
                  truckId: { type: Type.STRING },
                  action: { type: Type.STRING },
                  impact: { type: Type.STRING }
                },
                required: ["action", "impact"]
              }
            }
          },
          required: ["summary", "warnings", "recommendations"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      summary: "An error occurred while generating AI insights.",
      warnings: ["Connectivity issues"],
      recommendations: []
    };
  }
};
