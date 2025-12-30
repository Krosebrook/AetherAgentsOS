/**
 * @fileoverview Utility functions for AetherAgentsOS
 * @module utils
 */

import { LogEntry, Agent, HealthStatus, ActionableError } from '../types';
import { ERROR_CODES } from '../constants';

// =============================================================================
// ID GENERATION
// =============================================================================

/**
 * Generate a unique ID with optional prefix
 */
export function generateId(prefix = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`;
}

/**
 * Generate a sequential node ID
 */
export function generateNodeId(): string {
  return `node-${Date.now()}`;
}

// =============================================================================
// STRING UTILITIES
// =============================================================================

/**
 * Truncate a string to a maximum length with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.substring(0, maxLength - 3)}...`;
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format a string for display in logs
 */
export function formatLogMessage(message: string, maxLength = 100): string {
  return truncate(message.replace(/\n/g, ' '), maxLength);
}

// =============================================================================
// NUMBER UTILITIES
// =============================================================================

/**
 * Clamp a number between min and max values
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Round a number to specified decimal places
 */
export function round(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${round(bytes / Math.pow(k, i))} ${sizes[i]}`;
}

/**
 * Format milliseconds to human readable duration
 */
export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${round(ms / 1000)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = round((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

// =============================================================================
// DATE & TIME UTILITIES
// =============================================================================

/**
 * Format a timestamp to time string
 */
export function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Format a timestamp to datetime string
 */
export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Get relative time string (e.g., "2 minutes ago")
 */
export function getRelativeTime(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

// =============================================================================
// AGENT UTILITIES
// =============================================================================

/**
 * Get health status category from health value
 */
export function getHealthStatus(health: number): HealthStatus {
  if (health >= 80) return HealthStatus.HEALTHY;
  if (health >= 50) return HealthStatus.DEGRADED;
  if (health > 0) return HealthStatus.CRITICAL;
  return HealthStatus.OFFLINE;
}

/**
 * Calculate average health across agents
 */
export function calculateAverageHealth(agents: Agent[]): number {
  if (agents.length === 0) return 0;
  const total = agents.reduce((sum, agent) => sum + (agent.health ?? 100), 0);
  return round(total / agents.length);
}

/**
 * Simulate health fluctuation for an agent
 */
export function simulateHealthFluctuation(currentHealth: number): number {
  const delta = Math.random() > 0.5 ? 0.5 : -0.5;
  return clamp(currentHealth + delta, 0, 100);
}

/**
 * Estimate token count from text (rough approximation)
 */
export function estimateTokens(text: string): number {
  // Rough estimate: ~4 characters per token
  return Math.ceil(text.length / 4);
}

// =============================================================================
// VALIDATION UTILITIES
// =============================================================================

/**
 * Check if a string is a valid API key format
 */
export function isValidApiKey(key: string): boolean {
  return key.length >= 20 && /^[a-zA-Z0-9_-]+$/.test(key);
}

/**
 * Check if a value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validate agent configuration
 */
export function validateAgentConfig(agent: Partial<Agent>): string[] {
  const errors: string[] = [];

  if (!agent.name || agent.name.trim().length === 0) {
    errors.push('Agent name is required');
  }
  if (agent.temperature !== undefined && (agent.temperature < 0 || agent.temperature > 2)) {
    errors.push('Temperature must be between 0 and 2');
  }
  if (agent.thinkingBudget !== undefined && agent.thinkingBudget < 0) {
    errors.push('Thinking budget cannot be negative');
  }

  return errors;
}

// =============================================================================
// ERROR HANDLING UTILITIES
// =============================================================================

/**
 * Diagnose an error and return actionable information
 */
export function diagnoseError(err: Error & { code?: string }): ActionableError {
  const message = err.message || '';
  const code = err.code || ERROR_CODES.ENGINE_FAULT;

  let remediation = 'Consult the Aether protocol logs or check network connectivity.';
  let severity: 'high' | 'medium' | 'low' = 'high';

  if (code === ERROR_CODES.INVALID_ARGUMENTS) {
    remediation = 'Verify the command syntax. Example: set-key openai sk-xxxx';
    severity = 'medium';
  } else if (code === ERROR_CODES.MISSING_PROMPT) {
    remediation = 'Specify the instruction payload using the --prompt flag.';
    severity = 'medium';
  } else if (code === ERROR_CODES.AUTH_REQUIRED) {
    remediation = 'Provision a valid API key using the "set-key" command or the UI vault panel.';
    severity = 'high';
  } else if (code === ERROR_CODES.UNKNOWN_COMMAND) {
    remediation = 'Check the documentation via the "help" command for valid protocol verbs.';
    severity = 'low';
  } else if (message.includes('429') || message.toLowerCase().includes('quota')) {
    remediation = 'Quota exhausted or rate limit triggered. Implement exponential backoff or check billing status.';
    severity = 'medium';
  } else if (message.toLowerCase().includes('safety')) {
    remediation = 'The request was blocked by safety filters. Adjust the prompt or modify safety settings.';
    severity = 'medium';
  } else if (message.toLowerCase().includes('location') || message.includes('region')) {
    remediation = 'The selected model is unavailable in your current geographical region.';
    severity = 'high';
  } else if (message.includes('API_KEY')) {
    remediation = 'The system environment key is missing. Ensure API_KEY is configured.';
    severity = 'high';
  }

  return {
    error: message,
    code,
    remediation,
    severity,
    docs_link: 'https://ai.google.dev/gemini-api/docs',
  };
}

/**
 * Create a custom error with code
 */
export function createError(message: string, code: string): Error & { code: string } {
  const error = new Error(message) as Error & { code: string };
  error.code = code;
  return error;
}

// =============================================================================
// ASYNC UTILITIES
// =============================================================================

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

/**
 * Debounce a function
 */
export function debounce<T extends (...args: unknown[]) => void>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle a function
 */
export function throttle<T extends (...args: unknown[]) => void>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => { inThrottle = false; }, limit);
    }
  };
}

// =============================================================================
// ARRAY UTILITIES
// =============================================================================

/**
 * Take the last N items from an array
 */
export function takeLast<T>(arr: T[], n: number): T[] {
  return arr.slice(-n);
}

/**
 * Group array items by a key
 */
export function groupBy<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

// =============================================================================
// STORAGE UTILITIES
// =============================================================================

/**
 * Safely parse JSON with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Get item from localStorage with type safety
 */
export function getStorageItem<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return fallback;
    return JSON.parse(item) as T;
  } catch {
    return fallback;
  }
}

/**
 * Set item in localStorage
 */
export function setStorageItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}

// =============================================================================
// CLASSNAME UTILITIES
// =============================================================================

/**
 * Conditionally join class names
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
