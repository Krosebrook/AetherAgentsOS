import { vi } from 'vitest';

/**
 * Mock implementation of @google/genai
 * This prevents actual API calls during testing
 */
export const mockGoogleGenAI = {
  models: {
    generateContent: vi.fn(),
    generateContentStream: vi.fn(),
  },
};

/**
 * Factory for creating mock Gemini API responses
 */
export function createMockGeminiResponse(text: string, options: {
  withGrounding?: boolean;
} = {}) {
  const response: any = {
    text,
    candidates: [{
      groundingMetadata: options.withGrounding ? {
        groundingChunks: [
          {
            web: {
              uri: 'https://example.com/test',
              title: 'Test Citation',
            },
          },
        ],
      } : undefined,
    }],
  };

  return response;
}

/**
 * Factory for creating mock streaming responses
 */
export function createMockStreamResponse(text: string) {
  const chunks = text.split(' ').map((word, i) => ({
    text: text.split(' ').slice(0, i + 1).join(' ') + ' ',
  }));

  return {
    [Symbol.asyncIterator]: async function* () {
      for (const chunk of chunks) {
        yield chunk;
      }
    },
  };
}

// Mock the entire module
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn(() => mockGoogleGenAI),
}));
