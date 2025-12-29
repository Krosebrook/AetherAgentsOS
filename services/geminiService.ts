
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ModelType, AgentConfig } from "../types";

// Removed internal API_KEY constant to strictly use process.env.API_KEY directly in initialization

const TEXT_FALLBACK_CHAIN = [
  ModelType.FLASH,
  ModelType.PRO,
  ModelType.LITE,
];

// Always use named parameter for apiKey and obtain directly from process.env.API_KEY
export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const executeGeneration = async (
  model: string,
  config: AgentConfig,
  prompt: string,
  onStream?: (chunk: string) => void
) => {
  const startTime = Date.now();
  // Create a new instance right before making an API call
  const ai = getGeminiClient();
  
  const generationConfig: any = {
    systemInstruction: config.systemInstruction,
    temperature: config.temperature,
  };

  // Thinking Config is only available for Gemini 3 and 2.5 series models (including Flash Lite)
  const isThinkingSupported = model.includes('gemini-3') || 
                             model.includes('gemini-2.5') || 
                             model.includes('lite');

  if (config.thinkingBudget > 0 && isThinkingSupported) {
    generationConfig.thinkingConfig = { thinkingBudget: config.thinkingBudget };
    // Set matching maxOutputTokens when thinkingBudget is used to reserve tokens for response
    generationConfig.maxOutputTokens = Math.max(config.thinkingBudget * 2, 4096);
  }

  let effectivePrompt = prompt;
  // Use googleSearch tool for grounding when requested
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
      // Use .text property directly, not as a function
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
      // Use .text property directly
      text: result.text || "",
      // Extract website URLs from grounding chunks as per search grounding requirements
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
      // Stop retrying for specific errors like safety blocks or location restrictions
      if (error.message?.includes("location") || error.message?.includes("Safety")) {
        throw error;
      }
    }
  }

  throw lastError;
};
