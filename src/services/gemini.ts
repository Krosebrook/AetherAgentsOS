/**
 * @fileoverview Gemini AI Service for agent inference
 * @module services/gemini
 * @description Handles all Gemini API interactions with fallback support, streaming, and error handling
 */

import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { AgentConfig, ModelType, GenerationResult, GroundingChunk } from '../types';
import { TEXT_FALLBACK_CHAIN, API_CONFIG } from '../constants';

// =============================================================================
// CLIENT INITIALIZATION
// =============================================================================

/**
 * Get a new Gemini client instance
 * Uses process.env.API_KEY injected by Vite
 */
export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Please set the API_KEY environment variable.');
  }

  return new GoogleGenAI({ apiKey });
}

/**
 * Check if Gemini API is configured
 */
export function isGeminiConfigured(): boolean {
  return Boolean(process.env.API_KEY);
}

// =============================================================================
// MODEL UTILITIES
// =============================================================================

/**
 * Check if a model supports thinking/reasoning budget
 */
export function supportsThinking(model: string): boolean {
  return (
    model.includes('gemini-3') ||
    model.includes('gemini-2.5') ||
    model.includes('lite')
  );
}

/**
 * Check if a model supports search grounding
 */
export function supportsSearch(model: string): boolean {
  return model.includes('pro') || model.includes('flash-preview');
}

/**
 * Get the fallback chain for a given model
 */
export function getModelFallbackChain(primaryModel: ModelType): ModelType[] {
  const chain = [primaryModel];

  for (const fallback of TEXT_FALLBACK_CHAIN) {
    if (!chain.includes(fallback)) {
      chain.push(fallback);
    }
  }

  return chain;
}

// =============================================================================
// GENERATION CONFIGURATION
// =============================================================================

interface GenerationConfig {
  systemInstruction: string;
  temperature: number;
  thinkingConfig?: { thinkingBudget: number };
  maxOutputTokens?: number;
  tools?: Array<{ googleSearch: Record<string, never> }>;
}

/**
 * Build generation config from agent config
 */
function buildGenerationConfig(
  model: string,
  config: AgentConfig
): GenerationConfig {
  const generationConfig: GenerationConfig = {
    systemInstruction: config.systemInstruction,
    temperature: config.temperature,
  };

  // Configure thinking budget for supported models
  if (config.thinkingBudget > 0 && supportsThinking(model)) {
    generationConfig.thinkingConfig = {
      thinkingBudget: config.thinkingBudget
    };
    // Reserve tokens for response when using thinking budget
    generationConfig.maxOutputTokens = Math.max(
      config.thinkingBudget * 2,
      API_CONFIG.MAX_TOKENS
    );
  }

  // Configure search grounding for supported models
  if (config.useSearch && supportsSearch(model)) {
    generationConfig.tools = [{ googleSearch: {} }];
  }

  return generationConfig;
}

/**
 * Build the effective prompt with search context if needed
 */
function buildEffectivePrompt(prompt: string, config: AgentConfig): string {
  if (config.useSearch && config.searchQuery) {
    return `[EXTERNAL_RESEARCH_REQUIRED: "${config.searchQuery}"]\n\nUser Request: ${prompt}`;
  }
  return prompt;
}

// =============================================================================
// GENERATION EXECUTION
// =============================================================================

/**
 * Execute generation with streaming support
 */
async function executeStreamingGeneration(
  ai: GoogleGenAI,
  model: string,
  prompt: string,
  config: GenerationConfig,
  onStream: (chunk: string) => void
): Promise<GenerationResult> {
  const startTime = Date.now();

  const result = await ai.models.generateContentStream({
    model,
    contents: prompt,
    config: config as unknown as Record<string, unknown>,
  });

  let fullText = '';

  for await (const chunk of result) {
    const text = chunk.text || '';
    fullText += text;
    onStream(fullText);
  }

  return {
    text: fullText,
    latency: Date.now() - startTime,
    modelUsed: model,
  };
}

/**
 * Execute non-streaming generation
 */
async function executeNonStreamingGeneration(
  ai: GoogleGenAI,
  model: string,
  prompt: string,
  config: GenerationConfig
): Promise<GenerationResult> {
  const startTime = Date.now();

  const result: GenerateContentResponse = await ai.models.generateContent({
    model,
    contents: prompt,
    config: config as unknown as Record<string, unknown>,
  });

  // Extract grounding metadata if available
  const groundingChunks =
    result.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

  return {
    text: result.text || '',
    grounding: groundingChunks as GroundingChunk[],
    latency: Date.now() - startTime,
    modelUsed: model,
  };
}

/**
 * Execute generation for a specific model
 */
async function executeGeneration(
  model: string,
  config: AgentConfig,
  prompt: string,
  onStream?: (chunk: string) => void
): Promise<GenerationResult> {
  const ai = getGeminiClient();
  const generationConfig = buildGenerationConfig(model, config);
  const effectivePrompt = buildEffectivePrompt(prompt, config);

  if (onStream) {
    return executeStreamingGeneration(
      ai,
      model,
      effectivePrompt,
      generationConfig,
      onStream
    );
  }

  return executeNonStreamingGeneration(
    ai,
    model,
    effectivePrompt,
    generationConfig
  );
}

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Generate an agent response with automatic fallback
 *
 * @param config - Agent configuration
 * @param prompt - User prompt
 * @param onStream - Optional callback for streaming responses
 * @returns Generation result with text, latency, and model info
 * @throws Error if all models fail
 *
 * @example
 * ```ts
 * const result = await generateAgentResponse(
 *   agentConfig,
 *   "What is the capital of France?",
 *   (text) => console.log(text)
 * );
 * console.log(result.text); // "The capital of France is Paris."
 * ```
 */
export async function generateAgentResponse(
  config: AgentConfig,
  prompt: string,
  onStream?: (chunk: string) => void
): Promise<GenerationResult> {
  const modelsToTry = getModelFallbackChain(config.model);
  let lastError: Error | null = null;

  for (const model of modelsToTry) {
    try {
      return await executeGeneration(model, config, prompt, onStream);
    } catch (error) {
      lastError = error as Error;
      console.error(`Generation failed for model ${model}:`, error);

      // Don't retry for specific error types
      const errorMessage = (error as Error).message || '';
      if (
        errorMessage.includes('location') ||
        errorMessage.includes('Safety') ||
        errorMessage.includes('PERMISSION_DENIED')
      ) {
        throw error;
      }
    }
  }

  throw lastError || new Error('All models failed to generate a response');
}

/**
 * Test API key validity by making a minimal request
 */
export async function testApiConnection(): Promise<boolean> {
  try {
    const ai = getGeminiClient();
    await ai.models.generateContent({
      model: ModelType.LITE,
      contents: 'test',
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * List available models
 */
export function getAvailableModels(): Array<{
  id: ModelType;
  name: string;
  description: string;
}> {
  return [
    {
      id: ModelType.FLASH,
      name: 'Gemini 3 Flash',
      description: 'High speed, balanced latency',
    },
    {
      id: ModelType.PRO,
      name: 'Gemini 3 Pro',
      description: 'Advanced reasoning & complex logic',
    },
    {
      id: ModelType.LITE,
      name: 'Gemini Flash Lite',
      description: 'Optimized for high-efficiency',
    },
  ];
}

// =============================================================================
// EXPORTS
// =============================================================================

export type { GenerationResult };
