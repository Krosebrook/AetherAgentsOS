# Agent System Documentation

Complete documentation for understanding, configuring, and using agents in Aether Agentic IDE.

## Quick Start

An **Agent** is an autonomous AI entity powered by Google Gemini that:
- Has a unique identity and configuration
- Maintains conversation context
- Performs specialized tasks
- Can use tools (search, etc.)
- Provides observable metrics

## Agent Configuration

### Core Settings

```typescript
interface Agent {
  id: string;                    // Unique identifier  
  name: string;                  // Display name
  systemInstruction: string;     // Defines behavior & personality
  model: ModelType;              // FLASH, PRO, LITE, IMAGE, IMAGEN
  temperature: number;           // 0.0-1.0 (creativity level)
  useSearch: boolean;            // Enable web grounding
  searchQuery?: string;          // Optional search context
  thinkingBudget: number;        // Extended reasoning tokens
  health?: number;               // 0-100 health score
}
```

### Model Selection Guide

| Model | Speed | Quality | Cost | Best For |
|-------|-------|---------|------|----------|
| LITE | ⚡⚡⚡ | ⭐⭐ | $ | Quick Q&A, simple tasks |
| FLASH | ⚡⚡ | ⭐⭐⭐ | $$ | General purpose, balanced |
| PRO | ⚡ | ⭐⭐⭐⭐ | $$$ | Complex reasoning, research |
| IMAGE | ⚡⚡ | ⭐⭐⭐⭐ | $$ | Image understanding |
| IMAGEN | ⚡ | ⭐⭐⭐⭐ | $$$ | Image generation |

### Temperature Guide

- **0.0-0.3**: Deterministic, factual (code, data analysis)
- **0.4-0.6**: Balanced (general chat, support)
- **0.7-0.9**: Creative (writing, brainstorming)
- **1.0**: Maximum creativity (experimental)

## Agent Patterns

### Pattern 1: Single Specialized Agent
```typescript
// Customer Support Bot
{
  name: 'Support Agent',
  systemInstruction: 'You are a customer support specialist...',
  model: ModelType.FLASH,
  temperature: 0.6,
  useSearch: false
}
```

### Pattern 2: Research Agent with Search
```typescript
// Research Assistant
{
  name: 'Researcher',
  systemInstruction: 'You are a research analyst...',
  model: ModelType.PRO,
  temperature: 0.4,
  useSearch: true,  // Enable web grounding
  thinkingBudget: 4096  // Extended reasoning
}
```

### Pattern 3: Code Review Agent
```typescript
// Security Auditor
{
  name: 'Security Reviewer',
  systemInstruction: 'You are a security expert. Identify vulnerabilities...',
  model: ModelType.PRO,
  temperature: 0.2,  // Low for precision
  useSearch: false
}
```

## Workflow Integration

### Canvas Workflow Nodes

Agents can be composed into workflows on the canvas:

```
Trigger Node → Agent 1 (Research) → Agent 2 (Analyze) → Agent 3 (Report)
```

**Node Types Available**:
- **Agent**: AI processing
- **Tool**: External APIs (search, maps)
- **Guardrail**: Policy enforcement
- **Code**: Execute code
- **Docs**: Generate documents
- **Trigger**: Start workflow

## Best Practices

### System Instructions
✅ **DO**:
- Be specific about role and expertise
- Define output format
- Set clear boundaries
- Provide examples

❌ **DON'T**:
- Use vague instructions
- Mix multiple responsibilities
- Forget constraints

### Performance
- Use LITE for simple queries
- Enable search only when needed
- Limit thinking budget (cost/latency)
- Cache frequent queries

### Security
- Never hardcode API keys
- Validate all inputs
- Implement rate limiting
- Review agent outputs

## Troubleshooting

### Agent Not Responding
1. Check API key in environment
2. Verify network connectivity
3. Try fallback model (LITE)
4. Check rate limits

### Poor Quality Responses
1. Improve system instruction specificity
2. Adjust temperature
3. Try PRO model for complex tasks
4. Enable search for current info
5. Add thinking budget for reasoning

### Slow Responses
1. Use FLASH or LITE model
2. Reduce/disable thinking budget
3. Disable search if not needed
4. Enable streaming for progress

## API Reference

### Agent Management

```typescript
// Create agent
function addAgent(name?: string): void;

// Update configuration
function updateAgent(agent: Agent): void;

// Remove agent
function removeAgent(id: string): void;

// Switch active agent
function setActiveAgent(id: string): void;
```

### Generate Response

```typescript
import { generateAgentResponse } from './services/geminiService';

const result = await generateAgentResponse(
  agent,           // Agent configuration
  userPrompt,      // User input
  onStreamChunk    // Optional: streaming callback
);

// Result: { text, grounding?, latency, modelUsed }
```

## Examples

### Example 1: Technical Writer Agent
```typescript
{
  name: 'Tech Writer',
  systemInstruction: `You are a technical documentation specialist.
    - Write clear, concise documentation
    - Use Markdown formatting
    - Include code examples
    - Structure with headings`,
  model: ModelType.FLASH,
  temperature: 0.5
}
```

### Example 2: Data Analyst Agent
```typescript
{
  name: 'Data Analyst',
  systemInstruction: `You are a data analyst expert.
    - Analyze data patterns
    - Provide statistical insights
    - Visualize findings
    - Make recommendations`,
  model: ModelType.PRO,
  temperature: 0.3,
  thinkingBudget: 2048
}
```

### Example 3: Creative Content Agent
```typescript
{
  name: 'Content Creator',
  systemInstruction: `You are a creative content writer.
    - Engaging storytelling
    - SEO-optimized content
    - Brand voice consistency
    - Multiple format support`,
  model: ModelType.FLASH,
  temperature: 0.8,
  useSearch: true
}
```

## Advanced Topics

### Future Features (Roadmap)
- Inter-agent communication
- Persistent memory
- Custom tools/plugins
- Agent marketplace
- Multi-provider support (Claude, OpenAI)

### Contributing
See [CONTRIBUTING.md](../CONTRIBUTING.md) for how to improve agent capabilities.

---

*Last Updated: December 29, 2024*
