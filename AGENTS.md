# Agent System Documentation

This document provides comprehensive documentation for the AetherAgentsOS agent system, including architecture, configuration, and usage patterns.

## Table of Contents

- [Overview](#overview)
- [Agent Architecture](#agent-architecture)
- [Creating Agents](#creating-agents)
- [Agent Configuration](#agent-configuration)
- [Agent Lifecycle](#agent-lifecycle)
- [Health Monitoring](#health-monitoring)
- [Workflow Integration](#workflow-integration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

The agent system is the core of AetherAgentsOS, providing:

- **Multi-instance management**: Run multiple AI agents simultaneously
- **Configurable behavior**: Customize model, temperature, and capabilities
- **Health monitoring**: Track agent status and performance
- **Persistence**: Agents survive browser sessions via localStorage

### Key Concepts

| Concept | Description |
|---------|-------------|
| **Agent** | An AI instance with unique configuration and state |
| **Node** | Visual representation of an agent in workflows |
| **Health** | 0-100 score indicating agent operational status |
| **Thinking Budget** | Token allocation for extended reasoning |

---

## Agent Architecture

### Agent Interface

```typescript
interface Agent extends AgentConfig {
  id: string;           // Unique identifier (e.g., "node-1703956789123")
  health?: number;      // Current health score (0-100)
  lastLatency?: number; // Last inference latency in ms
  createdAt?: number;   // Creation timestamp
  lastActiveAt?: number;// Last activity timestamp
}

interface AgentConfig {
  name: string;              // Display name
  systemInstruction: string; // System prompt/persona
  model: ModelType;          // AI model selection
  temperature: number;       // Creativity (0-2)
  useSearch: boolean;        // Enable web grounding
  searchQuery?: string;      // Custom search override
  thinkingBudget: number;    // Extended reasoning tokens
  safetyFilters?: boolean;   // Content filtering
}
```

### Model Types

| Model | ID | Use Case | Features |
|-------|----|----|----------|
| **Flash** | `gemini-3-flash-preview` | General use | Fast, balanced, search |
| **Pro** | `gemini-3-pro-preview` | Complex tasks | Advanced reasoning, search |
| **Lite** | `gemini-flash-lite-latest` | High volume | Efficient, fast |
| **Image** | `gemini-2.5-flash-image` | Vision tasks | Image understanding |
| **Imagen** | `imagen-4.0-generate-001` | Image creation | Generation only |

---

## Creating Agents

### Via UI

1. Click the **+** button in the Sidebar
2. Or click "Provision New Node" in Orchestration view
3. Configure agent settings in the control panel

### Via Terminal

```bash
# Deploy with default settings
deploy

# Deploy with custom name
deploy "Research Agent"
```

### Programmatically

```typescript
import { useAgents } from '@/src/hooks';

const { addAgent } = useAgents();

// With defaults
const agent1 = addAgent();

// With custom config
const agent2 = addAgent({
  name: 'Security Auditor',
  model: ModelType.PRO,
  temperature: 0.3,
  systemInstruction: 'You are a security expert...'
});
```

---

## Agent Configuration

### System Instruction

The system instruction defines the agent's persona and behavior:

```typescript
const systemInstruction = `
You are a senior software architect specializing in React applications.

ROLE: Technical advisor and code reviewer
CONSTRAINTS:
- Provide TypeScript solutions only
- Follow React 19 best practices
- Consider performance implications

OUTPUT FORMAT:
- Start with a brief summary
- Include code examples
- List potential edge cases
`;
```

**Keywords** that get highlighted:
- `YOU ARE`, `ROLE`, `PERSONA`, `TASK` (indigo)
- `NEVER`, `ALWAYS`, `MUST`, `REQUIRED` (rose)
- `###` headings (white, bold)

### Temperature

Controls response creativity:

| Value | Behavior |
|-------|----------|
| 0.0 | Deterministic, focused |
| 0.5 | Balanced |
| 0.7 | Default, natural |
| 1.0 | Creative |
| 1.5+ | Highly creative, may hallucinate |

### Thinking Budget

Extended reasoning for complex tasks:

```typescript
// Disable thinking
thinkingBudget: 0

// Moderate reasoning
thinkingBudget: 4096

// Deep analysis
thinkingBudget: 16384

// Maximum reasoning
thinkingBudget: 32768
```

**Supported models**: Gemini 3 Flash, Gemini 3 Pro, Gemini Flash Lite

### Search Grounding

Enable web search for real-time information:

```typescript
// Basic search
useSearch: true

// Custom search query
useSearch: true,
searchQuery: "latest React 19 features 2024"
```

**Supported models**: Gemini 3 Flash (preview), Gemini 3 Pro (preview)

---

## Agent Lifecycle

```
┌─────────────┐
│   Created   │
│  (health:   │
│    100%)    │
└──────┬──────┘
       │
       ▼
┌─────────────┐     ┌─────────────┐
│   Active    │────▶│  Degraded   │
│ (health:    │     │ (health:    │
│  80-100%)   │     │  50-79%)    │
└──────┬──────┘     └──────┬──────┘
       │                    │
       │                    ▼
       │            ┌─────────────┐
       │            │  Critical   │
       │            │ (health:    │
       │            │  1-49%)     │
       │            └──────┬──────┘
       │                    │
       ▼                    ▼
┌─────────────┐     ┌─────────────┐
│   Removed   │     │   Offline   │
│             │     │ (health: 0) │
└─────────────┘     └─────────────┘
```

### State Management

```typescript
const { agents, updateAgent, removeAgent } = useAgents();

// Update agent
updateAgent({
  ...agent,
  temperature: 0.5,
  useSearch: true
});

// Remove agent (minimum 1 must remain)
removeAgent(agent.id);
```

---

## Health Monitoring

### Health Score

The health score (0-100) indicates agent operational status:

| Range | Status | Indicator |
|-------|--------|-----------|
| 80-100 | Healthy | Green pulse |
| 50-79 | Degraded | Yellow |
| 20-49 | Critical | Orange |
| 0-19 | Offline | Red |

### Health Simulation

In the current version, health is simulated with random fluctuation:

```typescript
// Updates every 5 seconds
health = Math.max(0, Math.min(100, health + (random > 0.5 ? 0.5 : -0.5)))
```

### Future: Real Health Metrics

Planned health factors:
- API response latency
- Error rate
- Token usage efficiency
- Session duration

---

## Workflow Integration

### Node Types

Agents can be represented as nodes in workflow canvas:

```typescript
const agentNode: WorkflowNode = {
  id: 'node-1',
  type: NodeType.AGENT,
  label: 'Research Agent',
  position: { x: 100, y: 100 },
  status: 'idle',
  data: {
    instruction: 'Analyze market trends',
    model: ModelType.PRO,
    thinkingBudget: 4096
  }
};
```

### Industrial Templates

**Autonomous Researcher**
```
Topic Input → Search Engine → Synthesis Agent → Report Generator
```

**Security Auditor**
```
Git Hook → Security Agent ← Rules Engine
              ↓
          Patch Generator
```

### Workflow Execution

```typescript
// Simulated execution (current)
runSimulation();

// Future: Real execution
await executeWorkflow(nodes, edges);
```

---

## Best Practices

### Naming Conventions

```typescript
// Good: Descriptive, role-based
name: "Security Auditor"
name: "Market Research Agent"
name: "Code Review Assistant"

// Avoid: Generic
name: "Agent 1"
name: "Test"
```

### System Instructions

```typescript
// Good: Structured, clear
systemInstruction: `
You are a code reviewer for React TypeScript projects.

TASK: Review pull requests for quality and best practices.

CONSTRAINTS:
- Focus on TypeScript type safety
- Flag performance issues
- Suggest testing strategies

OUTPUT: Structured review with severity levels.
`

// Avoid: Vague
systemInstruction: "Help with code"
```

### Model Selection

| Task | Recommended Model |
|------|-------------------|
| Quick answers | Flash |
| Complex analysis | Pro |
| High volume | Lite |
| Image analysis | Image |

### Temperature Guidelines

| Task | Temperature |
|------|-------------|
| Code generation | 0.2-0.4 |
| Analysis | 0.5-0.7 |
| Creative writing | 0.8-1.0 |
| Brainstorming | 1.0-1.5 |

---

## Troubleshooting

### Common Issues

**Agent not responding**
- Check API key configuration
- Verify model availability
- Check network connectivity

**High latency**
- Reduce thinking budget
- Switch to Flash model
- Disable search grounding

**Poor quality responses**
- Review system instruction
- Adjust temperature
- Increase thinking budget

**Health dropping**
- This is simulated behavior
- Future versions will have real metrics

### Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| `AUTH_REQUIRED` | Missing API key | Configure in API Terminal |
| `RATE_LIMITED` | Quota exceeded | Wait or upgrade quota |
| `SAFETY_BLOCKED` | Content filtered | Adjust prompt or disable filters |
| `REGION_RESTRICTED` | Model unavailable | Use different model |

### Debug Mode

```typescript
// In development, check console for:
console.error(`Generation failed for model ${model}:`, error);
```

---

## API Reference

### useAgents Hook

```typescript
interface UseAgentsReturn {
  agents: Agent[];
  activeAgent: Agent;
  activeAgentId: string;
  setActiveAgentId: (id: string) => void;
  addAgent: (params?: CreateAgentParams) => Agent;
  updateAgent: (agent: Agent) => void;
  removeAgent: (id: string) => void;
  averageHealth: number;
  isAtLimit: boolean;
}
```

### Terminal Commands

```bash
nodes              # List all agents
deploy [name]      # Create new agent
status             # Show health summary
clear              # Clear logs
help               # Show commands
```

---

## Future Roadmap

### Planned Features

- [ ] Agent collaboration protocols
- [ ] Persistent agent memory
- [ ] Agent-to-agent communication
- [ ] Custom tool integration
- [ ] Agent templates/presets
- [ ] Performance analytics
- [ ] Multi-modal capabilities

### Under Consideration

- Agent versioning
- Rollback capabilities
- A/B testing agents
- Agent marketplace

---

*Last updated: December 2024*
