/**
 * Usage Tracking and Cost Metering for AI API Calls
 * Monitors token usage, latency, and estimated costs
 */

import { ModelType } from '../types';

// Approximate token pricing (per 1M tokens) - update as needed
const MODEL_PRICING: Record<ModelType, { input: number; output: number }> = {
  [ModelType.FLASH]: { input: 0.075, output: 0.30 },
  [ModelType.PRO]: { input: 1.25, output: 5.00 },
  [ModelType.LITE]: { input: 0.0375, output: 0.15 },
  [ModelType.IMAGE]: { input: 0.30, output: 0.60 },
  [ModelType.IMAGEN]: { input: 0.00, output: 0.04 } // per image
};

export interface UsageRecord {
  id: string;
  timestamp: number;
  model: ModelType;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  estimatedCost: number;
  sessionId?: string;
  agentId?: string;
  cached: boolean;
}

export interface UsageMetrics {
  totalCalls: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalCost: number;
  averageLatency: number;
  cacheHitRate: number;
  byModel: Record<ModelType, ModelUsageMetrics>;
}

interface ModelUsageMetrics {
  calls: number;
  inputTokens: number;
  outputTokens: number;
  cost: number;
}

class UsageTracker {
  private records: UsageRecord[] = [];
  private readonly maxRecords = 1000;
  private cacheHits = 0;
  private cacheMisses = 0;

  /**
   * Rough token estimation for text
   * More accurate: use a proper tokenizer library
   */
  private estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token for English text
    return Math.ceil(text.length / 4);
  }

  /**
   * Calculate estimated cost for a model call
   */
  private calculateCost(
    model: ModelType,
    inputTokens: number,
    outputTokens: number
  ): number {
    const pricing = MODEL_PRICING[model];
    if (!pricing) return 0;

    const inputCost = (inputTokens / 1_000_000) * pricing.input;
    const outputCost = (outputTokens / 1_000_000) * pricing.output;
    
    return inputCost + outputCost;
  }

  /**
   * Track a new API call
   */
  track(params: {
    model: ModelType;
    prompt: string;
    response: string;
    latencyMs: number;
    sessionId?: string;
    agentId?: string;
    cached?: boolean;
  }): UsageRecord {
    const inputTokens = this.estimateTokens(params.prompt);
    const outputTokens = this.estimateTokens(params.response);
    const estimatedCost = params.cached 
      ? 0 
      : this.calculateCost(params.model, inputTokens, outputTokens);

    const record: UsageRecord = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      timestamp: Date.now(),
      model: params.model,
      inputTokens,
      outputTokens,
      latencyMs: params.latencyMs,
      estimatedCost,
      sessionId: params.sessionId,
      agentId: params.agentId,
      cached: params.cached || false
    };

    // Update cache metrics
    if (params.cached) {
      this.cacheHits++;
    } else {
      this.cacheMisses++;
    }

    // Add to records and maintain max size
    this.records.push(record);
    if (this.records.length > this.maxRecords) {
      this.records.shift();
    }

    // Log for observability
    console.info(`[Usage] Model: ${params.model}, Tokens: ${inputTokens}→${outputTokens}, Cost: $${estimatedCost.toFixed(6)}, Latency: ${params.latencyMs}ms, Cached: ${params.cached}`);

    return record;
  }

  /**
   * Get all usage records
   */
  getRecords(limit?: number): UsageRecord[] {
    if (limit) {
      return this.records.slice(-limit);
    }
    return [...this.records];
  }

  /**
   * Get usage metrics
   */
  getMetrics(): UsageMetrics {
    const byModel: Record<ModelType, ModelUsageMetrics> = {} as Record<ModelType, ModelUsageMetrics>;
    
    // Initialize all models
    Object.values(ModelType).forEach(model => {
      byModel[model] = {
        calls: 0,
        inputTokens: 0,
        outputTokens: 0,
        cost: 0
      };
    });

    let totalLatency = 0;

    this.records.forEach(record => {
      byModel[record.model].calls++;
      byModel[record.model].inputTokens += record.inputTokens;
      byModel[record.model].outputTokens += record.outputTokens;
      byModel[record.model].cost += record.estimatedCost;
      totalLatency += record.latencyMs;
    });

    const totalCacheAttempts = this.cacheHits + this.cacheMisses;
    const cacheHitRate = totalCacheAttempts === 0 ? 0 : this.cacheHits / totalCacheAttempts;

    return {
      totalCalls: this.records.length,
      totalInputTokens: this.records.reduce((sum, r) => sum + r.inputTokens, 0),
      totalOutputTokens: this.records.reduce((sum, r) => sum + r.outputTokens, 0),
      totalCost: this.records.reduce((sum, r) => sum + r.estimatedCost, 0),
      averageLatency: this.records.length === 0 ? 0 : totalLatency / this.records.length,
      cacheHitRate,
      byModel
    };
  }

  /**
   * Get metrics for a specific session
   */
  getSessionMetrics(sessionId: string): Partial<UsageMetrics> {
    const sessionRecords = this.records.filter(r => r.sessionId === sessionId);
    
    if (sessionRecords.length === 0) {
      return {
        totalCalls: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalCost: 0,
        averageLatency: 0
      };
    }

    const totalLatency = sessionRecords.reduce((sum, r) => sum + r.latencyMs, 0);

    return {
      totalCalls: sessionRecords.length,
      totalInputTokens: sessionRecords.reduce((sum, r) => sum + r.inputTokens, 0),
      totalOutputTokens: sessionRecords.reduce((sum, r) => sum + r.outputTokens, 0),
      totalCost: sessionRecords.reduce((sum, r) => sum + r.estimatedCost, 0),
      averageLatency: totalLatency / sessionRecords.length
    };
  }

  /**
   * Clear all records
   */
  clear(): void {
    this.records = [];
    this.cacheHits = 0;
    this.cacheMisses = 0;
  }

  /**
   * Export records as JSON
   */
  export(): string {
    return JSON.stringify({
      records: this.records,
      metrics: this.getMetrics(),
      exportedAt: new Date().toISOString()
    }, null, 2);
  }
}

// Singleton instance
export const usageTracker = new UsageTracker();
