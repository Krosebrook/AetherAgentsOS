
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ModelType, AgentConfig } from "../types";

const API_KEY = process.env.API_KEY || "";
const FALLBACK_TEXT_MODEL = ModelType.FLASH;
const FALLBACK_IMAGE_MODEL = ModelType.IMAGEN;

export const getGeminiClient = () => {
  if (!API_KEY) throw new Error("API Key is missing from environment.");
  return new GoogleGenAI({ apiKey: API_KEY });
};

/**
 * Internal helper to execute the actual generation logic.
 */
const executeGeneration = async (
  model: string,
  config: AgentConfig,
  prompt: string,
  onStream?: (chunk: string) => void
) => {
  const ai = getGeminiClient();
  const generationConfig: any = {
    systemInstruction: config.systemInstruction,
    temperature: config.temperature,
  };

  if (config.useSearch) {
    generationConfig.tools = [{ googleSearch: {} }];
  }

  if (onStream) {
    const result = await ai.models.generateContentStream({
      model,
      contents: prompt,
      config: generationConfig,
    });

    let fullText = "";
    for await (const chunk of result) {
      const text = chunk.text || "";
      fullText += text;
      onStream(text);
    }
    return fullText;
  } else {
    const result: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: prompt,
      config: generationConfig,
    });

    return {
      text: result.text || "",
      grounding: result.candidates?.[0]?.groundingMetadata?.groundingChunks || []
    };
  }
};

/**
 * Generates an agent response with built-in model fallback logic.
 */
export const generateAgentResponse = async (
  config: AgentConfig,
  prompt: string,
  onStream?: (chunk: string) => void
): Promise<any> => {
  const primaryModel = config.model;

  try {
    return await executeGeneration(primaryModel, config, prompt, onStream);
  } catch (error: any) {
    console.warn(`Primary text model [${primaryModel}] failed:`, error.message);

    if (primaryModel === FALLBACK_TEXT_MODEL || primaryModel === ModelType.IMAGE) {
      throw error;
    }

    console.info(`Initiating fallback to [${FALLBACK_TEXT_MODEL}]...`);
    
    try {
      return await executeGeneration(FALLBACK_TEXT_MODEL, config, prompt, onStream);
    } catch (fallbackError: any) {
      console.error(`Fallback text model [${FALLBACK_TEXT_MODEL}] also failed:`, fallbackError.message);
      throw fallbackError;
    }
  }
};

/**
 * Generates an image with fallback logic.
 * Tries Gemini 2.5 Flash Image first, then Imagen 4.0.
 */
export const generateImage = async (prompt: string): Promise<string | null> => {
  const ai = getGeminiClient();

  try {
    // Attempt 1: Gemini 2.5 Flash Image (Nano Banana Series)
    const response = await ai.models.generateContent({
      model: ModelType.IMAGE,
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1",
        },
      },
    });

    for (const part of response.candidates?.[0].content.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    // If no image part found, throw to trigger fallback
    throw new Error("No image data returned from primary model.");

  } catch (error: any) {
    console.warn(`Primary image model [${ModelType.IMAGE}] failed:`, error.message);
    console.info(`Initiating image fallback to [${FALLBACK_IMAGE_MODEL}]...`);

    try {
      // Attempt 2: Imagen 4.0 (Dedicated Image Generation Model)
      const response = await ai.models.generateImages({
        model: FALLBACK_IMAGE_MODEL,
        prompt: prompt,
        config: {
          numberOfImages: 1,
          aspectRatio: '1:1',
        },
      });

      if (response.generatedImages && response.generatedImages.length > 0) {
        const base64EncodeString = response.generatedImages[0].image.imageBytes;
        return `data:image/png;base64,${base64EncodeString}`;
      }
      
      return null;
    } catch (fallbackError: any) {
      console.error(`Fallback image model [${FALLBACK_IMAGE_MODEL}] failed:`, fallbackError.message);
      throw fallbackError;
    }
  }
};
