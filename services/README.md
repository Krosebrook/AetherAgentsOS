# Services Directory

This directory contains production-grade services for AI orchestration, caching, security, and monitoring.

## 📁 Service Overview

### `geminiService.ts`
**Main AI orchestration service** - Enhanced with caching, retry logic, and usage tracking.

**Key Features:**
- Multiple model support (Flash, Pro, Lite)
- Automatic fallback between models
- Streaming and non-streaming responses
- Search grounding support
- Thinking budget configuration

**New in v2.0:**
- Intelligent response caching
- Exponential backoff retry
- Usage cost tracking
- Input/output sanitization
- Session and agent tracking

```typescript
import { generateAgentResponse, getCacheMetrics, getUsageMetrics } from './services/geminiService';

const response = await generateAgentResponse(
  config,
  prompt,
  'session-123',  // Session ID for tracking
  'agent-001',    // Agent ID for tracking
  onStreamCallback
);
```

---

### `cache.ts`
**LRU Cache with TTL** - Memory-efficient caching for AI responses.

**Features:**
- Configurable size limit (default: 50MB)
- TTL-based expiration (default: 30 minutes)
- Automatic eviction of least recently used items
- Real-time metrics (hits, misses, evictions)
- Fingerprint-based cache keys

```typescript
import { LRUCache } from './services/cache';

const cache = new LRUCache(50, 30); // 50MB, 30min TTL
const key = LRUCache.generateKey(prompt, config);
const cached = cache.get(key);

if (!cached) {
  const response = await apiCall();
  cache.set(key, response);
}

console.log(`Hit rate: ${cache.getHitRate() * 100}%`);
```

---

### `retry.ts`
**Exponential Backoff Retry** - Resilient API call execution.

**Features:**
- Configurable retry attempts (default: 3)
- Exponential backoff (1s, 2s, 4s, 8s)
- Jitter to prevent thundering herd (±30%)
- Smart error detection (network, rate limits)
- Custom retry callbacks

```typescript
import { retryAICall } from './services/retry';

const result = await retryAICall(
  () => apiCall(params),
  (error, attempt) => {
    console.log(`Retry ${attempt}: ${error.message}`);
  }
);
```

---

### `usageTracker.ts`
**Cost & Usage Monitoring** - Track tokens, costs, and performance.

**Features:**
- Per-model cost calculation
- Token estimation (~4 chars/token)
- Session and agent tracking
- Cache hit/miss tracking
- Export functionality for analysis

```typescript
import { usageTracker } from './services/usageTracker';

// Automatic tracking in geminiService
// Or manual tracking:
usageTracker.track({
  model: ModelType.FLASH,
  prompt: input,
  response: output,
  latencyMs: 1200,
  sessionId: 'session-123',
  cached: false
});

// Get metrics
const metrics = usageTracker.getMetrics();
console.log(`Total cost: $${metrics.totalCost.toFixed(4)}`);
console.log(`Cache hit rate: ${metrics.cacheHitRate * 100}%`);

// Export for analysis
const data = usageTracker.export();
```

---

### `sanitization.ts`
**Security & Validation** - Prevent injection attacks and validate inputs.

**Features:**
- Prompt injection detection
- XSS prevention
- Input validation (length, type)
- Output sanitization
- Token-aware truncation
- HTML escaping utilities

```typescript
import { 
  sanitizePrompt, 
  validatePrompt, 
  sanitizeOutput,
  truncateToTokenLimit,
  escapeHtml
} from './services/sanitization';

// Validate
const validation = validatePrompt(input, { maxLength: 32000 });
if (!validation.isValid) {
  throw new Error(validation.errors.join(', '));
}

// Sanitize input
const sanitized = sanitizePrompt(input);
if (!sanitized.isClean) {
  console.warn('Security issues:', sanitized.detectedIssues);
}

// Truncate to token limit
const truncated = truncateToTokenLimit(sanitized.sanitized, 25000);

// Sanitize output
const cleanOutput = sanitizeOutput(aiResponse);

// Escape for HTML display
const safeHtml = escapeHtml(text);
```

---

## 🔄 Service Integration Flow

```
User Input
    ↓
[sanitization.ts] Validate & Sanitize
    ↓
[cache.ts] Check Cache
    ↓ (miss)
[retry.ts] Wrap API Call
    ↓
[geminiService.ts] Execute Generation
    ↓
[sanitization.ts] Sanitize Output
    ↓
[cache.ts] Store Result
    ↓
[usageTracker.ts] Track Metrics
    ↓
Return to User
```

---

## 📊 Metrics & Monitoring

### Cache Metrics
```typescript
const cacheMetrics = getCacheMetrics();
// {
//   hits: 150,
//   misses: 100,
//   evictions: 5,
//   currentSize: 25600000,  // bytes
//   maxSize: 52428800,
//   hitRate: 0.60
// }
```

### Usage Metrics
```typescript
const usageMetrics = getUsageMetrics();
// {
//   totalCalls: 250,
//   totalInputTokens: 37500,
//   totalOutputTokens: 62500,
//   totalCost: 0.0234,
//   averageLatency: 1150,
//   cacheHitRate: 0.40,
//   byModel: {
//     'gemini-3-flash-preview': {
//       calls: 200,
//       inputTokens: 30000,
//       outputTokens: 50000,
//       cost: 0.0180
//     },
//     ...
//   }
// }
```

---

## 🔒 Security Patterns Detected

### Prompt Injection Patterns
- `ignore previous instructions`
- `disregard all above prompts`
- `new instructions:`
- `[SYSTEM]`, `[INST]` tags
- Special tokens: `<|im_start|>`, `<|im_end|>`

### XSS/Harmful Patterns
- `<script>` tags
- `javascript:` URIs
- Event handlers: `onclick=`, `onerror=`
- `<iframe>` tags

---

## ⚙️ Configuration

### Cache Configuration
```typescript
// Adjust cache size and TTL
const cache = new LRUCache(
  100,  // 100MB max size
  60    // 60 minute TTL
);
```

### Retry Configuration
```typescript
// Custom retry options
await retryWithBackoff(fn, {
  maxRetries: 5,
  initialDelay: 2000,
  maxDelay: 30000,
  backoffMultiplier: 2,
  retryableErrors: ['ETIMEDOUT', 'rate_limit']
});
```

### Validation Constraints
```typescript
// Custom validation
const validation = validatePrompt(input, {
  minLength: 10,
  maxLength: 50000,
  allowEmpty: false
});
```

---

## 🧪 Testing

Each service is designed to be testable:

```typescript
// Mock cache for testing
const testCache = new LRUCache(1, 1); // 1MB, 1 min

// Mock usage tracker
usageTracker.clear();

// Test sanitization
const result = sanitizePrompt('test <script>alert(1)</script>');
expect(result.isClean).toBe(false);
```

---

## 📈 Performance Characteristics

### Cache
- **Time Complexity**: O(1) for get/set
- **Space Complexity**: O(n) where n is number of entries
- **Eviction**: Automatic when size limit reached

### Retry
- **Max Delay**: Configurable (default 8s)
- **Total Time**: ~15s for 3 retries (1s + 2s + 4s + 8s)
- **Overhead**: Minimal for successful calls

### Sanitization
- **Validation**: < 1ms for typical prompts
- **Truncation**: O(n) where n is text length
- **Pattern Detection**: O(p*n) where p is patterns, n is text length

---

## 🚀 Quick Start

```typescript
// 1. Import services
import { generateAgentResponse } from './services/geminiService';
import { getCacheMetrics, getUsageMetrics } from './services/geminiService';

// 2. Make AI call (caching, retry, tracking automatic)
const response = await generateAgentResponse(
  config,
  prompt,
  'session-id',
  'agent-id'
);

// 3. Monitor metrics
console.log('Cache:', getCacheMetrics());
console.log('Usage:', getUsageMetrics());
```

---

## 📚 Additional Documentation

- **Production Guide**: See `PRODUCTION_OPTIMIZATION_GUIDE.md`
- **Checklist**: See `PRODUCTION_OPTIMIZATION_CHECKLIST.md`
- **Testing**: See `TESTING.md`

---

**Version**: 2.0.0
**Last Updated**: January 8, 2026
