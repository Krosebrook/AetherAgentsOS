/**
 * @fileoverview Metrics tracking hook
 * @module hooks/useMetrics
 */

import { useState, useCallback, useMemo } from 'react';
import { InferenceMetric } from '../types';
import { UI_CONFIG } from '../constants';
import { takeLast, round, formatTime } from '../utils';

/**
 * Hook return type for metrics
 */
export interface UseMetricsReturn {
  /** All metrics data points */
  metrics: InferenceMetric[];
  /** Add a new metric */
  addMetric: (tokens: number, latency: number) => void;
  /** Clear all metrics */
  clearMetrics: () => void;
  /** Latest latency in seconds */
  latestLatency: number;
  /** Latest token count */
  latestTokens: number;
  /** Average latency across all metrics */
  averageLatency: number;
  /** Total tokens processed */
  totalTokens: number;
  /** Whether metrics are available */
  hasMetrics: boolean;
}

/**
 * Hook for managing inference metrics
 *
 * @param maxPoints - Maximum number of data points to retain
 * @returns Metrics functions and computed values
 *
 * @example
 * ```tsx
 * const { metrics, addMetric, averageLatency } = useMetrics();
 *
 * // After inference completes
 * addMetric(150, 1200); // 150 tokens, 1200ms latency
 * ```
 */
export function useMetrics(maxPoints = UI_CONFIG.MAX_METRICS_POINTS): UseMetricsReturn {
  const [metrics, setMetrics] = useState<InferenceMetric[]>([]);

  const addMetric = useCallback(
    (tokens: number, latency: number) => {
      const newMetric: InferenceMetric = {
        name: formatTime(Date.now()),
        tokens,
        latency: latency / 1000, // Convert to seconds
        timestamp: Date.now(),
      };

      setMetrics(prev => takeLast([...prev, newMetric], maxPoints));
    },
    [maxPoints]
  );

  const clearMetrics = useCallback(() => {
    setMetrics([]);
  }, []);

  // Computed values
  const latestLatency = useMemo(() => {
    if (metrics.length === 0) return 0;
    return round(metrics[metrics.length - 1].latency, 2);
  }, [metrics]);

  const latestTokens = useMemo(() => {
    if (metrics.length === 0) return 0;
    return metrics[metrics.length - 1].tokens;
  }, [metrics]);

  const averageLatency = useMemo(() => {
    if (metrics.length === 0) return 0;
    const sum = metrics.reduce((acc, m) => acc + m.latency, 0);
    return round(sum / metrics.length, 2);
  }, [metrics]);

  const totalTokens = useMemo(() => {
    return metrics.reduce((acc, m) => acc + m.tokens, 0);
  }, [metrics]);

  return {
    metrics,
    addMetric,
    clearMetrics,
    latestLatency,
    latestTokens,
    averageLatency,
    totalTokens,
    hasMetrics: metrics.length > 0,
  };
}

export default useMetrics;
