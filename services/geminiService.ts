
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ModelType, AgentConfig } from "../types";
import { LRUCache } from "./cache";
import { retryAICall } from "./retry";
import { usageTracker } from "./usageTracker";
import { sanitizePrompt, sanitizeOutput, validatePrompt, truncateToTokenLimit } from "./sanitization";

// Removed internal API_KEY constant to strictly use process.env.API_KEY directly in initialization

const TEXT_FALLBACK_CHAIN = [
  ModelType.FLASH,
  ModelType.PRO,
  ModelType.LITE,
];

// Initialize response cache (50MB, 30 min TTL)
const responseCache = new LRUCache<any>(50, 30);

// Always use named parameter for apiKey and obtain directly from process.env.API_KEY
export const getGeminiClient = (): GoogleGenAI => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const executeGeneration = async (
  model: string,
  config: AgentConfig,
  prompt: string,
  sessionId?: string,
  agentId?: string,
  onStream?: (chunk: string) => void
): Promise<any> => {
  const startTime = Date.now();
  
  // Validate and sanitize input
  const validation = validatePrompt(prompt, { maxLength: 30000 });
  if (!validation.isValid) {
    throw new Error(`Invalid prompt: ${validation.errors.join(', ')}`);
  }

  const sanitization = sanitizePrompt(prompt);
  if (!sanitization.isClean) {
    console.warn('[Security] Potential security issues detected in prompt:', sanitization.detectedIssues);
  }
  
  // Use sanitized prompt
  let effectivePrompt = sanitization.sanitized;

  // Truncate if needed (leaving room for system instruction)
  effectivePrompt = truncateToTokenLimit(effectivePrompt, 25000);

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

  // Use googleSearch tool for grounding when requested
  if (config.useSearch && (model.includes('pro') || model.includes('flash-preview'))) {
    generationConfig.tools = [{ googleSearch: {} }];
    
    if (config.searchQuery) {
      effectivePrompt = `[EXTERNAL_RESEARCH_REQUIRED: "${config.searchQuery}"]\n\nUser Request: ${effectivePrompt}`;
    }
  }

  // Streaming not cached for real-time responses
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
    
    const latency = Date.now() - startTime;
    const sanitizedOutput = sanitizeOutput(fullText);

    // Track usage
    usageTracker.track({
      model: config.model,
      prompt: effectivePrompt,
      response: sanitizedOutput,
      latencyMs: latency,
      sessionId,
      agentId,
      cached: false
    });

    return {
      text: sanitizedOutput,
      latency,
      modelUsed: model
    };
  } else {
    // Non-streaming: use cache
    const cacheKey = LRUCache.generateKey(effectivePrompt, {
      model,
      temperature: config.temperature,
      systemInstruction: config.systemInstruction,
      thinkingBudget: config.thinkingBudget
    });

    // Check cache first
    const cached = responseCache.get(cacheKey);
    if (cached) {
      console.info('[Cache] Hit - returning cached response');
      
      // Track cached usage
      usageTracker.track({
        model: config.model,
        prompt: effectivePrompt,
        response: cached.text || '',
        latencyMs: 0,
        sessionId,
        agentId,
        cached: true
      });

      return cached;
    }

    // Cache miss - make API call with retry
    const result: GenerateContentResponse = await ai.models.generateContent({
      model,
      contents: effectivePrompt,
      config: generationConfig,
    });

    const latency = Date.now() - startTime;
    const responseText = result.text || "";
    const sanitizedOutput = sanitizeOutput(responseText);

    const response = {
      text: sanitizedOutput,
      // Extract website URLs from grounding chunks as per search grounding requirements
      grounding: result.candidates?.[0]?.groundingMetadata?.groundingChunks || [],
      latency,
      modelUsed: model
    };

    // Cache the response
    responseCache.set(cacheKey, response);
    console.info('[Cache] Miss - cached new response');

    // Track usage
    usageTracker.track({
      model: config.model,
      prompt: effectivePrompt,
      response: sanitizedOutput,
      latencyMs: latency,
      sessionId,
      agentId,
      cached: false
    });

    return response;
  }
};

export const generateAgentResponse = async (
  config: AgentConfig,
  prompt: string,
  sessionId?: string,
  agentId?: string,
  onStream?: (chunk: string) => void
): Promise<any> => {
  const modelsToTry = [config.model];
  
  for (const fallback of TEXT_FALLBACK_CHAIN) {
    if (!modelsToTry.includes(fallback)) {
      modelsToTry.push(fallback);
    }
  }

  let lastError: any = null;
  let attemptCount = 0;

  for (const model of modelsToTry) {
    try {
      attemptCount++;
      
      // Wrap in retry logic with exponential backoff
      const result = await retryAICall(
        () => executeGeneration(model, config, prompt, sessionId, agentId, onStream),
        (error: Error, attempt: number) => {
          console.warn(
            `[Retry] Attempt ${attempt} for model ${model} failed: ${error.message}`
          );
        }
      );
      
      // Log successful model usage if fallback was used
      if (attemptCount > 1) {
        console.info(`[Fallback] Successfully used fallback model: ${model}`);
      }
      
      return result;
    } catch (error: any) {
      lastError = error;
      const errorMessage = error.message || String(error);
      
      console.error(`[AI Error] Generation failed for model ${model}:`, {
        model,
        error: errorMessage,
        attemptCount
      });
      
      // Stop retrying for specific errors like safety blocks or location restrictions
      if (errorMessage.includes("location") || errorMessage.includes("Safety")) {
        throw new Error(`Model ${model} blocked: ${errorMessage}`);
      }
    }
  }

  // All models failed
  throw new Error(
    `All models failed after ${attemptCount} attempts. Last error: ${lastError?.message || 'Unknown error'}`
  );
};

/**
 * Get cache metrics for monitoring
 */
export function getCacheMetrics() {
  return responseCache.getMetrics();
}

/**
 * Get usage metrics for cost tracking
 */
export function getUsageMetrics() {
  return usageTracker.getMetrics();
}

/**
 * Clear response cache (useful for testing or manual cache invalidation)
 */
export function clearCache() {
  responseCache.clear();
  console.info('[Cache] Cleared all cached responses');
}

