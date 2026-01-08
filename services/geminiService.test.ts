import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateAgentResponse } from './geminiService';
import { mockAgent, mockAgentWithSearch, mockAgentWithThinking } from '../test/fixtures/mockData';
import { mockGoogleGenAI, createMockGeminiResponse } from '../test/mocks/gemini.mock';

describe('geminiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateAgentResponse', () => {
    it('should generate response for basic agent', async () => {
      const mockResponse = createMockGeminiResponse('Test response from Gemini');
      mockGoogleGenAI.models.generateContent.mockResolvedValueOnce(mockResponse);

      const result = await generateAgentResponse(mockAgent, 'Test prompt');

      expect(result.text).toBe('Test response from Gemini');
      expect(result.modelUsed).toBe(mockAgent.model);
      expect(result.latency).toBeGreaterThan(0);
      expect(mockGoogleGenAI.models.generateContent).toHaveBeenCalledOnce();
    });

    it('should handle search grounding when useSearch is true', async () => {
      const mockResponse = createMockGeminiResponse('Response with grounding', {
        withGrounding: true,
      });
      mockGoogleGenAI.models.generateContent.mockResolvedValueOnce(mockResponse);

      const result = await generateAgentResponse(mockAgentWithSearch, 'Research query');

      expect(result.text).toBe('Response with grounding');
      expect(result.grounding).toBeDefined();
      expect(result.grounding.length).toBeGreaterThan(0);
      expect(mockGoogleGenAI.models.generateContent).toHaveBeenCalledOnce();
    });

    it('should configure thinking budget for supported models', async () => {
      const mockResponse = createMockGeminiResponse('Thoughtful response');
      mockGoogleGenAI.models.generateContent.mockResolvedValueOnce(mockResponse);

      const result = await generateAgentResponse(mockAgentWithThinking, 'Complex problem');

      expect(result.text).toBe('Thoughtful response');
      expect(mockGoogleGenAI.models.generateContent).toHaveBeenCalledOnce();
      
      const callConfig = mockGoogleGenAI.models.generateContent.mock.calls[0][0].config;
      expect(callConfig.thinkingConfig).toBeDefined();
      expect(callConfig.thinkingConfig.thinkingBudget).toBe(4096);
    });

    it('should handle streaming responses', async () => {
      const chunks = ['Hello', ' world', '!'];
      let fullText = '';
      
      const mockStream = {
        [Symbol.asyncIterator]: async function* () {
          for (const chunk of chunks) {
            fullText += chunk;
            yield { text: chunk };
          }
        },
      };

      mockGoogleGenAI.models.generateContentStream.mockResolvedValueOnce(mockStream);

      const streamedTexts: string[] = [];
      const result = await generateAgentResponse(
        mockAgent,
        'Test streaming',
        (text) => streamedTexts.push(text)
      );

      expect(result.text).toBe('Hello world!');
      expect(streamedTexts.length).toBeGreaterThan(0);
      expect(mockGoogleGenAI.models.generateContentStream).toHaveBeenCalledOnce();
    });

    it('should handle API errors gracefully', async () => {
      mockGoogleGenAI.models.generateContent.mockRejectedValueOnce(
        new Error('API rate limit exceeded')
      );

      await expect(generateAgentResponse(mockAgent, 'Test')).rejects.toThrow();
    });

    it('should not log API keys', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      const mockResponse = createMockGeminiResponse('Response');
      mockGoogleGenAI.models.generateContent.mockResolvedValueOnce(mockResponse);

      await generateAgentResponse(mockAgent, 'Test');

      const allLogs = consoleSpy.mock.calls.flat().join(' ');
      expect(allLogs).not.toContain(process.env.API_KEY);
      
      consoleSpy.mockRestore();
    });

    it('should use system instruction from agent config', async () => {
      const mockResponse = createMockGeminiResponse('Configured response');
      mockGoogleGenAI.models.generateContent.mockResolvedValueOnce(mockResponse);

      await generateAgentResponse(mockAgent, 'Test');

      const callConfig = mockGoogleGenAI.models.generateContent.mock.calls[0][0].config;
      expect(callConfig.systemInstruction).toBe(mockAgent.systemInstruction);
    });

    it('should use temperature from agent config', async () => {
      const mockResponse = createMockGeminiResponse('Temp response');
      mockGoogleGenAI.models.generateContent.mockResolvedValueOnce(mockResponse);

      await generateAgentResponse(mockAgent, 'Test');

      const callConfig = mockGoogleGenAI.models.generateContent.mock.calls[0][0].config;
      expect(callConfig.temperature).toBe(mockAgent.temperature);
    });
  });
});
