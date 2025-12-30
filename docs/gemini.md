# Google Gemini Integration Guide

Complete guide to Gemini API integration in Aether Agentic IDE.

## Overview

Aether uses Google's **Gemini API** (`@google/genai` v1.34.0) for all AI agent capabilities. This document covers setup, configuration, models, and best practices.

## Quick Setup

### 1. Get API Key

1. Visit [Google AI Studio](https://aistudio.google.com/)
2. Sign in with Google account
3. Click "Get API Key"
4. Create new project or select existing
5. Copy API key

### 2. Configure Environment

**Development**:
```bash
# Create .env file
echo "VITE_GEMINI_API_KEY=your_api_key_here" > .env
```

**Production**:
```bash
# Set environment variable
export VITE_GEMINI_API_KEY=your_api_key_here
```

### 3. Verify Setup

```typescript
// geminiService.ts will auto-detect API key
import { getGeminiClient } from './services/geminiService';

const client = getGeminiClient();
// Client initialized with process.env.API_KEY
```

## Available Models

### Text Generation Models

#### gemini-3-flash-preview (FLASH)
- **Speed**: Fast (2-4s response)
- **Quality**: High
- **Cost**: Medium
- **Use**: General purpose, balanced performance
- **Context**: 1M tokens
- **Features**: Search, thinking, multimodal

#### gemini-3-pro-preview (PRO)
- **Speed**: Moderate (4-8s response)
- **Quality**: Highest
- **Cost**: High
- **Use**: Complex reasoning, research, code
- **Context**: 2M tokens
- **Features**: Search, thinking, advanced reasoning

#### gemini-flash-lite-latest (LITE)
- **Speed**: Ultra-fast (1-2s response)
- **Quality**: Good
- **Cost**: Low
- **Use**: Simple queries, high-throughput
- **Context**: 1M tokens
- **Features**: Basic text generation

### Multimodal Models

#### gemini-2.5-flash-image (IMAGE)
- **Purpose**: Image understanding
- **Input**: Text + images
- **Output**: Text descriptions, analysis
- **Use Cases**: Image captioning, OCR, visual Q&A

#### imagen-4.0-generate-001 (IMAGEN)
- **Purpose**: Image generation
- **Input**: Text prompts
- **Output**: Generated images
- **Use Cases**: Visual content creation

## Model Selection Decision Tree

```
Need image generation? → IMAGEN
Need image understanding? → IMAGE
├─ Complex reasoning needed? → PRO
├─ Simple query? → LITE
└─ General purpose? → FLASH
```

## Core Features

### 1. Streaming Responses

Enable real-time response display:

```typescript
const result = await generateAgentResponse(
  agentConfig,
  prompt,
  (partialText) => {
    // Update UI with partial response
    setDisplayText(partialText);
  }
);
```

**Benefits**:
- Immediate user feedback
- Perceived faster response
- Cancellable operations

### 2. Search Grounding

Connect agents to real-world data:

```typescript
const config = {
  model: ModelType.FLASH, // or PRO
  useSearch: true,
  searchQuery: 'latest AI research 2024', // optional context
  // ... other config
};
```

**Features**:
- Web search integration
- Citation links provided
- Grounded in current data
- Reduces hallucinations

**Response Format**:
```typescript
{
  text: "Based on recent research...",
  grounding: [
    {
      web: {
        uri: "https://example.com/article",
        title: "Recent AI Advances"
      }
    }
  ]
}
```

### 3. Extended Thinking

Enable deep reasoning (Gemini 3+ models):

```typescript
const config = {
  model: ModelType.PRO,
  thinkingBudget: 4096, // reasoning tokens
  // ... other config
};
```

**How It Works**:
1. Model reasons internally
2. Produces better responses
3. Shows thinking process (optional)

**Cost Implications**:
- Thinking tokens count toward total
- Higher latency (more processing)
- Better quality for complex tasks

**Recommended Budgets**:
- Simple: 0 (disabled)
- Medium: 2048-4096
- Complex: 8192-16384

## Service Layer Architecture

### geminiService.ts

```typescript
// Get client instance
export const getGeminiClient = () => {
  return new GoogleGenAI({ 
    apiKey: process.env.API_KEY 
  });
};

// Generate response with config
export const generateAgentResponse = async (
  config: AgentConfig,
  prompt: string,
  onStream?: (chunk: string) => void
): Promise<{
  text: string;
  grounding?: any[];
  latency: number;
  modelUsed: string;
}>;
```

### Fallback Chain

Automatic model fallback for reliability:

```typescript
const FALLBACK_CHAIN = [
  ModelType.FLASH,   // Try primary
  ModelType.PRO,     // Try upgraded
  ModelType.LITE     // Fallback to lite
];
```

**Fallback Triggers**:
- Model unavailable
- API errors
- Rate limits
- Region restrictions

**NOT Retried**:
- Safety blocks
- Location restrictions
- Invalid API keys

## API Configuration

### Generation Config

```typescript
const generationConfig = {
  systemInstruction: string,      // Agent personality
  temperature: number,            // 0.0-1.0 creativity
  maxOutputTokens?: number,       // Max response length
  thinkingConfig?: {
    thinkingBudget: number        // Reasoning tokens
  },
  tools?: [{
    googleSearch: {}              // Enable search
  }],
  safetySettings?: [...]          // Content filtering
};
```

### Safety Settings

```typescript
// Default: Balanced filtering
safetySettings: [
  {
    category: "HARM_CATEGORY_HARASSMENT",
    threshold: "BLOCK_MEDIUM_AND_ABOVE"
  },
  // ... other categories
]
```

**Categories**:
- Harassment
- Hate speech
- Sexually explicit
- Dangerous content

**Thresholds**:
- BLOCK_NONE
- BLOCK_LOW_AND_ABOVE
- BLOCK_MEDIUM_AND_ABOVE (default)
- BLOCK_ONLY_HIGH

## Rate Limits & Quotas

### Free Tier (AI Studio API Key)
- **Requests**: 60 per minute
- **Tokens**: 1M input, 32K output per minute
- **Daily**: No strict limit

### Rate Limit Handling

```typescript
try {
  const result = await generateAgentResponse(config, prompt);
} catch (error) {
  if (error.message.includes('429')) {
    // Rate limited - implement backoff
    await sleep(60000); // Wait 1 minute
    retry();
  }
}
```

## Best Practices

### API Key Security

✅ **DO**:
- Store in environment variables
- Use `.env` for development
- Rotate keys regularly
- Set up usage alerts
- Implement rate limiting

❌ **DON'T**:
- Commit keys to Git
- Share keys publicly
- Store in localStorage
- Hardcode in source

### Cost Optimization

1. **Model Selection**: Use cheapest sufficient model
2. **Caching**: Cache frequent queries
3. **Thinking Budget**: Only use when needed
4. **Search**: Enable only for current data needs
5. **Context**: Minimize prompt length

### Error Handling

```typescript
try {
  const result = await generateAgentResponse(config, prompt);
} catch (error) {
  if (error.message?.includes('location')) {
    // Gemini not available in this region
    showError('Service unavailable in your location');
  } else if (error.message?.includes('Safety')) {
    // Content blocked by safety filters
    showError('Response blocked by safety filters');
  } else {
    // Generic error
    showError('Failed to generate response');
  }
  
  // Log for debugging
  console.error('Gemini API Error:', error);
}
```

## Performance Optimization

### 1. Streaming
Always use streaming for better UX:
```typescript
await generateAgentResponse(config, prompt, (chunk) => {
  updateUI(chunk); // Real-time updates
});
```

### 2. Concurrency
Limit concurrent requests:
```typescript
const MAX_CONCURRENT = 3;
const queue = new PQueue({ concurrency: MAX_CONCURRENT });
```

### 3. Timeouts
Implement request timeouts:
```typescript
const timeout = 30000; // 30 seconds
const controller = new AbortController();
setTimeout(() => controller.abort(), timeout);
```

## Troubleshooting

### Issue: API Key Not Found

**Error**: "API key not configured"

**Solutions**:
```bash
# Check .env file exists
ls -la .env

# Verify key is set
echo $VITE_GEMINI_API_KEY

# Restart dev server
npm run dev
```

### Issue: 403 Forbidden

**Causes**:
- Invalid API key
- Key disabled
- Region restricted

**Solutions**:
1. Verify key in [AI Studio](https://aistudio.google.com/)
2. Check key restrictions (IP, referrer)
3. Ensure API is enabled for project

### Issue: Rate Limited (429)

**Solutions**:
- Implement exponential backoff
- Reduce request frequency
- Upgrade to paid tier
- Use caching

### Issue: Model Not Found

**Error**: "Model 'gemini-x' not found"

**Solutions**:
- Check model name spelling
- Verify model availability in region
- Use fallback models
- Update `@google/genai` package

## Monitoring & Analytics

### Track Usage

```typescript
let totalTokens = 0;
let totalCost = 0;

// After each request
totalTokens += estimatedTokens;
totalCost += calculateCost(model, tokens);

// Display metrics
console.log(`Usage: ${totalTokens} tokens, $${totalCost}`);
```

### Cost Calculation

Approximate costs (check current pricing):
```typescript
const COST_PER_1K_TOKENS = {
  [ModelType.LITE]: 0.0001,
  [ModelType.FLASH]: 0.0002,
  [ModelType.PRO]: 0.0010,
};

function calculateCost(model: ModelType, tokens: number): number {
  return (tokens / 1000) * COST_PER_1K_TOKENS[model];
}
```

## Advanced Features

### Multimodal Input (Images)

```typescript
// Coming in future version
const result = await generateAgentResponse({
  model: ModelType.IMAGE,
  // ... config
}, {
  text: "What's in this image?",
  images: [imageData]
});
```

### Function Calling

```typescript
// Planned feature
const tools = [{
  function_declarations: [{
    name: 'get_weather',
    description: 'Get weather for location',
    parameters: { location: 'string' }
  }]
}];
```

## Resources

### Official Documentation
- [Gemini API Docs](https://ai.google.dev/docs)
- [Model Cards](https://ai.google.dev/models)
- [Pricing](https://ai.google.dev/pricing)
- [Safety Guide](https://ai.google.dev/docs/safety)

### Tools
- [AI Studio](https://aistudio.google.com/) - Test models, get API keys
- [Model Garden](https://ai.google.dev/models) - Browse available models
- [Code Examples](https://github.com/google/generative-ai-js)

### Support
- [Stack Overflow](https://stackoverflow.com/questions/tagged/google-gemini)
- [GitHub Issues](https://github.com/google/generative-ai-js/issues)
- [Google AI Discord](https://discord.gg/google-ai)

## Migration Guide

### From Other Providers

#### From OpenAI
```typescript
// OpenAI
const response = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: prompt }]
});

// Gemini equivalent
const response = await generateAgentResponse({
  model: ModelType.PRO,
  systemInstruction: "",
  temperature: 0.7
}, prompt);
```

#### From Claude
```typescript
// Claude
const response = await anthropic.messages.create({
  model: "claude-3-opus",
  messages: [{ role: "user", content: prompt }]
});

// Gemini equivalent  
const response = await generateAgentResponse({
  model: ModelType.PRO,
  systemInstruction: "",
  temperature: 0.7
}, prompt);
```

## Future Roadmap

### Planned Enhancements
- Multi-provider support (OpenAI, Claude)
- Advanced function calling
- Native multimodal support
- Fine-tuning integration
- Batch processing
- Prompt caching
- Advanced safety controls

---

*Last Updated: December 29, 2024*  
*Gemini API Version: 1.34.0*
