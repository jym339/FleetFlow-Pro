
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getFleetInsights = async (fleetData: any) => {
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
};
