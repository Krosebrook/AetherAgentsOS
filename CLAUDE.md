# CLAUDE.md - AI Assistant Development Guide

This document provides context and guidance for AI assistants (Claude, GitHub Copilot, etc.) working on the AetherAgentsOS codebase.

## Project Overview

**AetherAgentsOS** is a Progressive Web Application for orchestrating multi-modal AI agents powered by Google Gemini. It provides an IDE-like interface for agent management, workflow design, and performance monitoring.

## Quick Context

```yaml
Project: AetherAgentsOS
Type: PWA / SPA
Stack: React 19, TypeScript 5.8, Vite 6, Tailwind CSS
AI: Google Gemini (@google/genai)
Storage: IndexedDB (Dexie) + localStorage
Version: 0.1.0 (Pre-MVP)
```

## Code Standards

### TypeScript

- **Strict typing**: Avoid `any` type; define interfaces in `src/types/`
- **Enums**: Use for fixed sets (ModelType, NodeType, LogLevel)
- **Generics**: Use for reusable utilities and hooks
- **Export types**: Use `export type` for type-only exports

```typescript
// Good
interface AgentConfig {
  name: string;
  model: ModelType;
  temperature: number;
}

// Avoid
const config: any = { ... };
```

### React Components

- **Functional components only**: No class components except ErrorBoundary
- **Typed props**: Always define prop interfaces
- **Hooks**: Prefer custom hooks for logic extraction
- **Memoization**: Use `useMemo`/`useCallback` for expensive operations

```typescript
// Component structure
interface Props {
  agent: Agent;
  onUpdate: (agent: Agent) => void;
}

const AgentCard: React.FC<Props> = ({ agent, onUpdate }) => {
  // Implementation
};

export default AgentCard;
```

### Styling

- **Tailwind CSS**: Use utility classes exclusively
- **Dark theme**: slate-950 background, slate-200 text
- **Consistent spacing**: Use Tailwind spacing scale
- **Icons**: Lucide React only

```typescript
// Standard dark theme classes
className="bg-slate-950 text-slate-200 border-slate-800"

// Interactive elements
className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl"
```

### File Organization

```
src/
├── components/          # React components
│   ├── ui/             # Base UI (buttons, inputs)
│   ├── shared/         # Shared (ErrorBoundary)
│   └── features/       # Feature-specific
├── features/           # Domain modules
├── hooks/              # Custom hooks
├── services/           # API integrations
├── contexts/           # React Context
├── types/              # TypeScript types
├── constants/          # App constants
└── utils/              # Utility functions
```

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/types/index.ts` | All TypeScript interfaces and enums |
| `src/constants/index.ts` | Application constants and defaults |
| `src/utils/index.ts` | Utility functions |
| `src/services/gemini.ts` | Gemini API integration |
| `src/hooks/useAgents.ts` | Agent management hook |
| `src/contexts/ApiKeysContext.tsx` | API key storage context |
| `App.tsx` | Main application component |
| `types.ts` | Legacy types (migrating to src/) |

## Agent System

### Agent Interface

```typescript
interface Agent {
  id: string;               // Unique identifier
  name: string;             // Display name
  systemInstruction: string;// System prompt
  model: ModelType;         // AI model
  temperature: number;      // 0-2 creativity
  useSearch: boolean;       // Web grounding
  searchQuery?: string;     // Custom search
  thinkingBudget: number;   // Extended reasoning tokens
  safetyFilters?: boolean;  // Content filtering
  health?: number;          // 0-100 health score
}
```

### Available Models

```typescript
enum ModelType {
  FLASH = 'gemini-3-flash-preview',   // Fast, balanced
  PRO = 'gemini-3-pro-preview',       // Advanced reasoning
  LITE = 'gemini-flash-lite-latest',  // Efficient
  IMAGE = 'gemini-2.5-flash-image',   // Image understanding
  IMAGEN = 'imagen-4.0-generate-001'  // Image generation
}
```

## Gemini Integration

### Basic Generation

```typescript
import { generateAgentResponse } from '@/src/services/gemini';

const result = await generateAgentResponse(
  agentConfig,
  "Your prompt here",
  (streamChunk) => setResponse(streamChunk) // Optional streaming
);

console.log(result.text);      // Response text
console.log(result.latency);   // Response time (ms)
console.log(result.grounding); // Search sources
```

### Features

- **Streaming**: Real-time response chunks
- **Fallback chain**: FLASH → PRO → LITE
- **Search grounding**: Web results integration
- **Thinking budget**: Extended reasoning (up to 32K tokens)

## State Management

### Agent State

```typescript
const { agents, activeAgent, addAgent, updateAgent, removeAgent } = useAgents(
  (level, source, message) => addLog(level, source, message)
);
```

### API Keys

```typescript
const { keys, setKey, removeKey, hasKey, isLoading } = useApiKeys();

await setKey('anthropic', 'sk-ant-...');
if (hasKey('openai')) { ... }
```

### Logging

```typescript
const { logs, addLog, clearLogs } = useLogger();

addLog('info', 'SYSTEM', 'Agent deployed');
addLog('error', 'API', 'Request failed');
```

## Common Tasks

### Creating a New Agent

```typescript
const newAgent = addAgent({
  name: 'Research Agent',
  model: ModelType.PRO,
  temperature: 0.7
});
```

### Adding a New Component

1. Create in appropriate location (`src/components/` or `src/features/`)
2. Define props interface
3. Export from component or feature index
4. Add to App.tsx if it's a main view

### Adding a New Hook

1. Create in `src/hooks/`
2. Follow naming convention: `use{Name}.ts`
3. Export from `src/hooks/index.ts`
4. Document return type interface

### Adding a Terminal Command

1. Edit `handleCommand` in `App.tsx`
2. Add case to switch statement
3. Update help text
4. Add to TERMINAL_COMMANDS in constants

## Error Handling

### API Errors

```typescript
try {
  const result = await generateAgentResponse(config, prompt);
} catch (error) {
  const diagnosed = diagnoseError(error);
  // diagnosed.error - error message
  // diagnosed.code - error code
  // diagnosed.remediation - how to fix
  // diagnosed.severity - high/medium/low
}
```

### Component Errors

```typescript
import { ErrorBoundary } from '@/src/components/shared/ErrorBoundary';

<ErrorBoundary
  onError={(error, info) => logError(error)}
  showDetails={isDevelopment}
>
  <MyComponent />
</ErrorBoundary>
```

## Testing (When Implemented)

```typescript
// Future: Vitest + React Testing Library
import { render, screen } from '@testing-library/react';
import { AgentCard } from './AgentCard';

test('displays agent name', () => {
  render(<AgentCard agent={mockAgent} />);
  expect(screen.getByText('Test Agent')).toBeInTheDocument();
});
```

## Do's and Don'ts

### Do

- Use TypeScript strict mode
- Follow existing patterns in similar files
- Add proper error handling
- Use constants for magic values
- Document complex logic
- Keep components focused and small

### Don't

- Use `any` type without justification
- Create class components (except ErrorBoundary)
- Add inline styles (use Tailwind)
- Commit API keys or secrets
- Skip loading/error states
- Make breaking changes without updating types

## Performance Guidelines

- Lazy load heavy components
- Memoize expensive calculations
- Use virtualization for long lists
- Debounce frequent updates
- Avoid unnecessary re-renders

## Accessibility

- Add aria-labels to interactive elements
- Maintain focus management
- Support keyboard navigation
- Provide text alternatives for visual content

## Getting Help

- Check existing components for patterns
- Review type definitions for interfaces
- Consult README.md for setup
- See ARCHITECTURE.md for system design
- Reference GEMINI.md for API details

---

*Last updated: December 2024*
