
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ModelType, AgentConfig } from "../types";

const API_KEY = process.env.API_KEY || "";

/**
 * Fallback priority chain for text generation.
 * If the user's selected model fails, the system attempts these in order.
 */
const TEXT_FALLBACK_CHAIN = [
  ModelType.FLASH,
  ModelType.LITE,
];

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

  // Google Search is supported on Pro and Flash series, but not currently on Lite.
  if (config.useSearch && (model.includes('pro') || model.includes('flash-preview'))) {
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
      onStream(fullText); // Send full accumulated text to ensure UI consistency
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
 * Generates an agent response with an automated multi-tier model fallback.
 * Cycle: User Selection -> Gemini 3 Flash -> Gemini Flash Lite.
 */
export const generateAgentResponse = async (
  config: AgentConfig,
  prompt: string,
  onStream?: (chunk: string) => void
): Promise<any> => {
  const modelsToTry = [config.model];
  
  // Build fallback sequence, avoiding duplicates
  for (const fallback of TEXT_FALLBACK_CHAIN) {
    if (!modelsToTry.includes(fallback)) {
      modelsToTry.push(fallback);
    }
  }

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      if (lastError) {
        console.info(`Triggering fallback for [${config.model}] -> Attempting [${model}]...`);
        // Notify UI to clear any partial failed generation text
        if (onStream) onStream(""); 
      }
      return await executeGeneration(model, config, prompt, onStream);
    } catch (error: any) {
      lastError = error;
      console.warn(`Generation via [${model}] failed: ${error.message || 'Unknown Protocol Error'}`);
      
      // Stop early if it's a permanent user-side error (e.g. location required)
      if (error.message?.includes("location") || error.message?.includes("Safety")) {
        throw error;
      }
    }
  }

  throw lastError;
};

/**
 * Generates an image with fallback logic.
 * Tries Gemini 2.5 Flash Image first, then Imagen 4.0.
 */
export const generateImage = async (prompt: string): Promise<string | null> => {
  const ai = getGeminiClient();

  try {
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
    
    throw new Error("No image data returned from Nano Banana engine.");

  } catch (error: any) {
    console.warn(`Primary image model failed: ${error.message}`);
    console.info(`Initiating image fallback to [${ModelType.IMAGEN}]...`);

    try {
      const response = await ai.models.generateImages({
        model: ModelType.IMAGEN,
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
      console.error(`Imagen 4.0 fallback failed:`, fallbackError.message);
      throw fallbackError;
    }
  }
};
