
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { Project, RoomConfig, AppLanguage, FurnitureItem } from "@/types";

/**
 * Helper to handle rate limits (429) with exponential backoff.
 */
async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> {
  let delay = 2000;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      const isRateLimit = error?.message?.includes('429') || error?.status === 429 || error?.code === 429;
      if (isRateLimit && i < maxRetries - 1) {
        console.warn(`Rate limit hit, retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
        continue;
      }
      throw error;
    }
  }
  return fn(); // Final try
}

export const generateMainBuildingImages = async (project: Project): Promise<{ before: string; after: string }> => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is missing. Using placeholder images.");
    return { 
      before: "", 
      after: `https://picsum.photos/seed/${project.style}-building/1200/800` 
    };
  }
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const afterPrompt = `Architectural 3D concept: Finished ${project.style} ${project.type} building. Painted in ${project.colors.primary} (${project.colors.shade} shade). Landscaping, ${project.floors} floors. Professional photography, 8k resolution, cinematic lighting.`;

  const generateImg = async (prompt: string) => {
    return withRetry(async () => {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "16:9" } }
      });
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
      return "";
    });
  };

  const after = await generateImg(afterPrompt);
  return { before: "", after };
};

export const generateRoomVisuals = async (room: RoomConfig, style: string): Promise<{ before: string; after: string }> => {
  if (!process.env.GEMINI_API_KEY) {
    return { 
      before: "", 
      after: `https://picsum.photos/seed/${room.name}-${style}/1200/800` 
    };
  }
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const afterPrompt = `Interior concept: Finished and LUXURIOUSLY FURNISHED ${room.name} in ${style} style. Walls painted in ${room.color}. AI-selected high-quality furniture. Beautiful interior design, warm professional lighting, photorealistic, 4k.`;

  const generateImg = async (prompt: string) => {
    return withRetry(async () => {
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts: [{ text: prompt }] },
        config: { imageConfig: { aspectRatio: "16:9" } }
      });
      for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
      }
      return "";
    });
  };

  const after = await generateImg(afterPrompt);
  return { before: "", after };
};

export const extractFurnitureDetails = async (room: RoomConfig, buildingType: string): Promise<FurnitureItem[]> => {
  if (!process.env.GEMINI_API_KEY) {
    return [
      { name: "Demo Sofa", rate: 45000, type: "Modern Chesterfield", shopLink: "#" },
      { name: "Demo Table", rate: 12000, type: "Oak Coffee Table", shopLink: "#" }
    ];
  }
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `Act as an interior designer. For a ${room.name} in a ${buildingType} building with ${room.color} theme, suggest 4 essential furniture items. 
  If it's a Living Room, you MUST include a specific Sofa type.
  For each item, provide:
  1. Item name
  2. Realistic average rate in INR
  3. Specific type (e.g. "Chesterfield Sofa", "Ergonomic Office Chair", "King Size Teak Bed")
  Return strictly as JSON.`;

  // Fix: Explicitly typing response as GenerateContentResponse to fix 'unknown' access error.
  const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            rate: { type: Type.NUMBER },
            type: { type: Type.STRING }
          },
          required: ["name", "rate", "type"]
        }
      }
    }
  }));

  try {
    // Access response.text property directly.
    const items = JSON.parse(response.text || "[]");
    return items.map((i: any) => ({
      ...i,
      shopLink: `https://www.flipkart.com/search?q=${encodeURIComponent(i.name + " " + i.type)}`
    }));
  } catch {
    return [];
  }
};

export const generateProjectSummary = async (project: Project, lang: AppLanguage): Promise<string> => {
  if (!process.env.GEMINI_API_KEY) {
    return "Demo Mode: This is a beautiful architectural concept designed with Zero-Build AI.";
  }
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = `Provide a simple and short description (max 3 sentences) in ${lang} for a ${project.type} building.
  Details: ${project.plot.totalArea} sq.ft, ${project.floors} floors, ${project.style} style, ${project.colors.primary} theme.
  Keep it very brief and professional.`;
  
  const response: GenerateContentResponse = await withRetry(() => ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt
  }));
  return response.text || "";
};

export const getSystemInstruction = (language: AppLanguage) => {
  return `You are the Zero-Build AI Assistant.
  
  SCOPE LIMITATIONS:
  - Answer ONLY questions related to building design, architectural styles, construction materials, interior decoration, furniture, and project budgeting.
  - If a user asks about anything else, you MUST respond with EXACTLY: "Sorry, wrong question."
  
  GUIDELINES:
  - Language: Respond strictly in ${language}.
  - Be professional and brief.`;
};
