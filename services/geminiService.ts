
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ModelType, AgentConfig } from "../types";

const API_KEY = process.env.API_KEY || "";

const TEXT_FALLBACK_CHAIN = [
  ModelType.FLASH,
  ModelType.LITE,
];

export const getGeminiClient = () => {
  if (!API_KEY) throw new Error("API Key is missing from environment.");
  return new GoogleGenAI({ apiKey: API_KEY });
};

const executeGeneration = async (
  model: string,
  config: AgentConfig,
  prompt: string,
  onStream?: (chunk: string) => void
) => {
  const startTime = Date.now();
  const ai = getGeminiClient();
  
  const generationConfig: any = {
    systemInstruction: config.systemInstruction,
    temperature: config.temperature,
  };

  // Thinking Config is only available for Gemini 3 and 2.5 series models.
  if (config.thinkingBudget > 0 && (model.includes('gemini-3') || model.includes('gemini-2.5'))) {
    generationConfig.thinkingConfig = { thinkingBudget: config.thinkingBudget };
    // Set a matching maxOutputTokens if thinkingBudget is used to ensure room for final response.
    generationConfig.maxOutputTokens = Math.max(config.thinkingBudget * 2, 4096);
  }

  let effectivePrompt = prompt;
  if (config.useSearch && (model.includes('pro') || model.includes('flash-preview'))) {
    generationConfig.tools = [{ googleSearch: {} }];
    
    if (config.searchQuery) {
      effectivePrompt = `[EXTERNAL_RESEARCH_REQUIRED: "${config.searchQuery}"]\n\nUser Request: ${prompt}`;
    }
  }

  if (onStream) {
    const result = await ai.models.generateContentStream({
      model,
      contents: effectivePrompt,
      config: generationConfig,
    });

    let fullText = "";
    for await (const chunk of result) {
      const text = chunk.text || "";
      fullText += text;
      onStream(fullText);
    }
    
    return {
      text: fullText,
      latency: Date.now() - startTime,
      modelUsed: model
    };
  } else {
    const result: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: effectivePrompt,
      config: generationConfig,
    });

    return {
      text: result.text || "",
      grounding: result.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
      latency: Date.now() - startTime,
      modelUsed: model
    };
  }
};

export const generateAgentResponse = async (
  config: AgentConfig,
  prompt: string,
  onStream?: (chunk: string) => void
): Promise<any> => {
  const modelsToTry = [config.model];
  
  for (const fallback of TEXT_FALLBACK_CHAIN) {
    if (!modelsToTry.includes(fallback)) {
      modelsToTry.push(fallback);
    }
  }

  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      return await executeGeneration(model, config, prompt, onStream);
    } catch (error: any) {
      lastError = error;
      console.error(`Generation failed for model ${model}:`, error);
      // Don't retry for safety or location errors
      if (error.message?.includes("location") || error.message?.includes("Safety")) {
        throw error;
      }
    }
  }

  throw lastError;
};
