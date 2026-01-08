/**
 * Input Sanitization and Validation for AI Prompts
 * Prevents prompt injection, validates input, and sanitizes outputs
 */

/**
 * Patterns that may indicate prompt injection attempts
 */
const INJECTION_PATTERNS = [
  /ignore\s+(previous|all|above)\s+(instructions?|prompts?|directions?)/gi,
  /disregard\s+(previous|all|above)\s+(instructions?|prompts?)/gi,
  /forget\s+(previous|all|above)\s+(instructions?|prompts?)/gi,
  /new\s+instructions?:/gi,
  /system\s*:\s*/gi,
  /\[SYSTEM\]/gi,
  /\[INST\]/gi,
  /\[\/INST\]/gi,
  /<\|im_start\|>/gi,
  /<\|im_end\|>/gi,
  /```system/gi,
];

/**
 * Potentially harmful patterns to detect
 */
const HARMFUL_PATTERNS = [
  /<script[^>]*>.*?<\/script>/gis,
  /javascript:/gi,
  /on\w+\s*=\s*["'][^"']*["']/gi,
  /<iframe[^>]*>/gi,
];

export interface SanitizationResult {
  sanitized: string;
  isClean: boolean;
  detectedIssues: string[];
  originalLength: number;
  sanitizedLength: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Sanitize user input to prevent prompt injection
 */
export function sanitizePrompt(input: string): SanitizationResult {
  if (!input || typeof input !== 'string') {
    return {
      sanitized: '',
      isClean: false,
      detectedIssues: ['Input must be a non-empty string'],
      originalLength: 0,
      sanitizedLength: 0
    };
  }

  const originalLength = input.length;
  const detectedIssues: string[] = [];
  let sanitized = input;

  // Check for injection patterns
  INJECTION_PATTERNS.forEach((pattern) => {
    if (pattern.test(sanitized)) {
      detectedIssues.push(`Potential injection pattern detected: ${pattern.source}`);
      // Remove or neutralize the pattern
      sanitized = sanitized.replace(pattern, '[REDACTED]');
    }
  });

  // Check for harmful patterns
  HARMFUL_PATTERNS.forEach((pattern) => {
    if (pattern.test(sanitized)) {
      detectedIssues.push(`Potentially harmful pattern detected: ${pattern.source}`);
      sanitized = sanitized.replace(pattern, '[REMOVED]');
    }
  });

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  // Remove control characters except newlines and tabs
  sanitized = sanitized.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');

  const isClean = detectedIssues.length === 0;

  if (!isClean) {
    console.warn(`[Security] Sanitized prompt with ${detectedIssues.length} issues:`, detectedIssues);
  }

  return {
    sanitized,
    isClean,
    detectedIssues,
    originalLength,
    sanitizedLength: sanitized.length
  };
}

/**
 * Validate prompt input
 */
export function validatePrompt(
  input: string,
  options: {
    minLength?: number;
    maxLength?: number;
    allowEmpty?: boolean;
  } = {}
): ValidationResult {
  const {
    minLength = 1,
    maxLength = 32000, // Gemini context limit consideration
    allowEmpty = false
  } = options;

  const errors: string[] = [];

  // Check type
  if (typeof input !== 'string') {
    errors.push('Input must be a string');
    return { isValid: false, errors };
  }

  // Check empty
  if (!allowEmpty && input.trim().length === 0) {
    errors.push('Input cannot be empty');
  }

  // Check length
  if (input.length < minLength) {
    errors.push(`Input must be at least ${minLength} characters`);
  }

  if (input.length > maxLength) {
    errors.push(`Input must not exceed ${maxLength} characters`);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize AI response output
 */
export function sanitizeOutput(output: string): string {
  if (!output || typeof output !== 'string') {
    return '';
  }

  let sanitized = output;

  // Remove any potential script injections
  HARMFUL_PATTERNS.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, '[REMOVED_FOR_SECURITY]');
  });

  // Escape HTML entities for display (if needed)
  // Note: This depends on where the output is displayed
  // For now, we'll just ensure no dangerous tags remain
  
  return sanitized.trim();
}

/**
 * Truncate text to token limit with smart splitting
 */
export function truncateToTokenLimit(
  text: string,
  maxTokens: number,
  estimateRatio: number = 4 // chars per token
): string {
  const maxChars = maxTokens * estimateRatio;
  
  if (text.length <= maxChars) {
    return text;
  }

  // Try to split at sentence boundary
  const truncated = text.substring(0, maxChars);
  const lastPeriod = truncated.lastIndexOf('.');
  const lastNewline = truncated.lastIndexOf('\n');
  
  const splitPoint = Math.max(lastPeriod, lastNewline);
  
  if (splitPoint > maxChars * 0.8) {
    // If we found a good split point, use it
    return truncated.substring(0, splitPoint + 1);
  }
  
  // Otherwise, just truncate and add ellipsis
  return truncated + '...';
}

/**
 * Validate and sanitize system instruction
 */
export function validateSystemInstruction(instruction: string): ValidationResult {
  const validation = validatePrompt(instruction, {
    minLength: 10,
    maxLength: 10000,
    allowEmpty: false
  });

  if (!validation.isValid) {
    return validation;
  }

  // Additional checks for system instructions
  const sanitization = sanitizePrompt(instruction);
  
  if (!sanitization.isClean) {
    return {
      isValid: false,
      errors: sanitization.detectedIssues
    };
  }

  return { isValid: true, errors: [] };
}

/**
 * HTML escape for safe display (basic implementation)
 */
export function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  return text.replace(/[&<>"'/]/g, (char) => map[char] || char);
}
