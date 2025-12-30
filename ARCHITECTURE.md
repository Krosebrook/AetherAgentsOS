# Architecture Documentation

This document provides a comprehensive overview of the AetherAgentsOS system architecture, including design decisions, component relationships, and data flow.

## Table of Contents

- [System Overview](#system-overview)
- [Technology Stack](#technology-stack)
- [Directory Structure](#directory-structure)
- [Component Architecture](#component-architecture)
- [State Management](#state-management)
- [Data Flow](#data-flow)
- [Service Layer](#service-layer)
- [Storage Architecture](#storage-architecture)
- [PWA Architecture](#pwa-architecture)
- [Security Architecture](#security-architecture)
- [Future Architecture](#future-architecture)

---

## System Overview

AetherAgentsOS is a Progressive Web Application (PWA) designed for multi-modal AI agent orchestration. It follows a client-side architecture with no backend server, using IndexedDB and localStorage for persistence.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT BROWSER                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    PRESENTATION LAYER                     │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────┐ │   │
│  │  │ Sidebar │ │ Chat    │ │ Canvas  │ │ Orchestration   │ │   │
│  │  │         │ │ View    │ │ View    │ │ View            │ │   │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────────────┘ │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────────────────────────┐ │   │
│  │  │ Metrics │ │ API     │ │ System Terminal             │ │   │
│  │  │ View    │ │ Terminal│ │                             │ │   │
│  │  └─────────┘ └─────────┘ └─────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    LOGIC LAYER                           │   │
│  │  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐│   │
│  │  │ useAgents   │ │ useLogger   │ │ useMetrics          ││   │
│  │  └─────────────┘ └─────────────┘ └─────────────────────┘│   │
│  │  ┌─────────────┐ ┌─────────────────────────────────────┐│   │
│  │  │ ApiKeys     │ │ Utility Functions                   ││   │
│  │  │ Context     │ │                                     ││   │
│  │  └─────────────┘ └─────────────────────────────────────┘│   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    SERVICE LAYER                         │   │
│  │  ┌─────────────────────────────────────────────────────┐│   │
│  │  │              Gemini Service                          ││   │
│  │  │  - generateAgentResponse()                          ││   │
│  │  │  - getGeminiClient()                                ││   │
│  │  │  - Model fallback chain                             ││   │
│  │  └─────────────────────────────────────────────────────┘│   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    STORAGE LAYER                         │   │
│  │  ┌─────────────────┐   ┌───────────────────────────────┐│   │
│  │  │  localStorage    │   │  IndexedDB (Dexie)           ││   │
│  │  │  - Agents       │   │  - API Keys                  ││   │
│  │  │  - Settings     │   │  - Secure Storage            ││   │
│  │  └─────────────────┘   └───────────────────────────────┘│   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     EXTERNAL SERVICES                            │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Google Gemini API                         ││
│  │  - Text generation (Flash, Pro, Lite)                       ││
│  │  - Image understanding                                       ││
│  │  - Search grounding                                          ││
│  │  - Extended thinking                                         ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Core Technologies

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **UI Framework** | React | 19.2.3 | Component-based UI |
| **Language** | TypeScript | 5.8.2 | Type safety |
| **Build Tool** | Vite | 6.2.0 | Fast development/builds |
| **Styling** | Tailwind CSS | 3.x (CDN) | Utility-first CSS |
| **AI SDK** | @google/genai | 1.34.0 | Gemini API client |
| **Charts** | Recharts | 3.6.0 | Data visualization |
| **Icons** | Lucide React | 0.562.0 | Icon library |
| **DB** | Dexie | 4.0.11 | IndexedDB wrapper |

### Development Tools

| Tool | Purpose |
|------|---------|
| **Vite** | Development server, HMR, bundling |
| **TypeScript** | Static type checking |
| **ESM** | ES Module imports |

### PWA Technologies

| Technology | Purpose |
|------------|---------|
| **Service Worker** | Offline caching, background sync |
| **Web Manifest** | Install prompt, app metadata |
| **IndexedDB** | Structured data storage |

---

## Directory Structure

### Current Structure (Hybrid)

```
AetherAgentsOS/
├── src/                          # NEW: Modular source
│   ├── components/               # React components
│   │   ├── ui/                   # Base UI components
│   │   ├── shared/               # ErrorBoundary, etc.
│   │   └── features/             # Feature-specific
│   ├── features/                 # Domain modules
│   │   ├── agents/               # Agent management
│   │   ├── chat/                 # Chat interface
│   │   ├── canvas/               # Workflow editor
│   │   ├── metrics/              # Telemetry
│   │   ├── orchestration/        # Node manager
│   │   └── terminal/             # CLI interface
│   ├── hooks/                    # Custom React hooks
│   │   ├── useAgents.ts
│   │   ├── useLogger.ts
│   │   └── useMetrics.ts
│   ├── services/                 # External services
│   │   └── gemini.ts             # Gemini API
│   ├── contexts/                 # React Context
│   │   └── ApiKeysContext.tsx
│   ├── types/                    # TypeScript types
│   │   └── index.ts
│   ├── constants/                # App constants
│   │   └── index.ts
│   ├── utils/                    # Utility functions
│   │   └── index.ts
│   └── assets/                   # Static assets
│
├── components/                   # LEGACY: Original components
│   ├── Sidebar.tsx
│   ├── ChatView.tsx
│   ├── CanvasView.tsx
│   ├── MetricsView.tsx
│   ├── OrchestrationView.tsx
│   ├── SystemTerminal.tsx
│   ├── ApiTerminal.tsx
│   └── AgentControlPanel.tsx
│
├── services/                     # LEGACY: Original services
│   └── geminiService.ts
│
├── contexts/                     # LEGACY: Original contexts
│   └── ApiKeysContext.tsx
│
├── App.tsx                       # Main application
├── index.tsx                     # Entry point
├── types.ts                      # LEGACY: Types
├── index.html                    # HTML template
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript config
├── package.json                  # Dependencies
├── manifest.json                 # PWA manifest
└── sw.js                         # Service worker
```

### Target Structure (v1.0)

```
AetherAgentsOS/
├── src/
│   ├── app/                      # App configuration
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── components/
│   │   ├── ui/                   # Button, Input, Card, etc.
│   │   └── shared/               # ErrorBoundary, Loading
│   ├── features/
│   │   ├── agents/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── chat/
│   │   ├── canvas/
│   │   ├── metrics/
│   │   ├── orchestration/
│   │   └── terminal/
│   ├── hooks/                    # Shared hooks
│   ├── services/                 # Shared services
│   ├── contexts/                 # Global contexts
│   ├── types/                    # Shared types
│   ├── constants/                # Constants
│   ├── utils/                    # Utilities
│   └── assets/                   # Static files
├── public/                       # Public assets
├── tests/                        # Test files
└── docs/                         # Documentation
```

---

## Component Architecture

### Component Hierarchy

```
App
├── ApiKeysProvider (Context)
│   └── Main Layout
│       ├── Sidebar
│       │   ├── Navigation Menu
│       │   ├── Agent List
│       │   └── Status Panel
│       │
│       └── Main Content
│           ├── ChatView (when activeTab='chat')
│           │   ├── Header
│           │   ├── Message List
│           │   ├── Thinking Indicator
│           │   └── Input Form
│           │
│           ├── CanvasView (when activeTab='canvas')
│           │   ├── Sidebar (Blueprints)
│           │   ├── Canvas Area
│           │   │   ├── SVG Edges
│           │   │   └── Node Elements
│           │   └── Node Settings Panel
│           │
│           ├── MetricsView (when activeTab='metrics')
│           │   ├── Stats Cards
│           │   ├── Token Chart
│           │   └── Latency Chart
│           │
│           ├── ApiTerminal (when activeTab='terminal')
│           │   ├── Header
│           │   ├── Provider Grid
│           │   ├── Key Input Forms
│           │   ├── Command History
│           │   └── Command Input
│           │
│           ├── OrchestrationView (when activeTab='orchestration')
│           │   ├── Header
│           │   ├── Agent Cards Grid
│           │   └── Add Agent Card
│           │
│           ├── SystemTerminal (floating)
│           │   ├── Header Bar
│           │   ├── Log Display
│           │   └── Command Input
│           │
│           └── AgentControlPanel (when activeTab='chat')
│               ├── Header
│               ├── Name Input
│               ├── Model Selector
│               ├── Temperature Slider
│               ├── Thinking Budget Slider
│               ├── System Instruction
│               └── Feature Toggles
```

### Component Responsibilities

| Component | Responsibility |
|-----------|----------------|
| **App** | State management, routing, layout |
| **Sidebar** | Navigation, agent selection |
| **ChatView** | Chat interface, message handling |
| **CanvasView** | Workflow visualization, node editing |
| **MetricsView** | Performance charts |
| **ApiTerminal** | API key management, testing |
| **OrchestrationView** | Agent grid management |
| **SystemTerminal** | CLI interface, logs |
| **AgentControlPanel** | Agent configuration |

---

## State Management

### State Categories

```typescript
// Global State (Context)
- API Keys → ApiKeysContext (IndexedDB)

// Application State (App.tsx)
- agents: Agent[]           // All agent instances
- activeAgentId: string     // Selected agent
- activeTab: TabId          // Current view
- metrics: InferenceMetric[]// Performance data
- logs: LogEntry[]          // System logs
- isTerminalOpen: boolean   // Terminal visibility

// Component State (Local)
- messages: Message[]       // Chat history (ChatView)
- nodes: WorkflowNode[]     // Canvas nodes (CanvasView)
- history: TerminalResponse[] // Command history (ApiTerminal)
```

### State Flow

```
┌──────────────────────────────────────────────────────────────┐
│                        App.tsx                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │ agents   │  │ metrics  │  │ logs     │  │ activeTab    │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘  │
└───────┼─────────────┼─────────────┼───────────────┼──────────┘
        │             │             │               │
        ▼             ▼             ▼               ▼
┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────────┐
│ Sidebar   │  │MetricsView│  │  System   │  │  Tab Content  │
│           │  │           │  │  Terminal │  │  (ChatView,   │
│ agents    │  │ metrics   │  │  logs     │  │   Canvas...)  │
└───────────┘  └───────────┘  └───────────┘  └───────────────┘
```

### State Persistence

| State | Storage | Sync |
|-------|---------|------|
| Agents | localStorage | On change |
| API Keys | IndexedDB | On change |
| Metrics | Memory only | Lost on refresh |
| Logs | Memory only | Lost on refresh |

---

## Data Flow

### Chat Flow

```
User Input
    │
    ▼
┌─────────────────┐
│   ChatView      │
│   handleSubmit  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Create User Msg │
│ Update State    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  geminiService  │
│  generateAgent  │
│  Response()     │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐  ┌───────────┐
│Stream │  │Final Resp │
│Chunk  │  │with Meta  │
└───┬───┘  └─────┬─────┘
    │            │
    ▼            ▼
┌─────────────────┐
│  Update Msgs    │
│  Update Metrics │
│  Add Log        │
└─────────────────┘
```

### Agent Creation Flow

```
Add Button Click
      │
      ▼
┌────────────────┐
│ handleAddAgent │
│    (App.tsx)   │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ Create Agent   │
│ Object         │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ setAgents()    │
│ Update State   │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ useEffect      │
│ Save to        │
│ localStorage   │
└───────┬────────┘
        │
        ▼
┌────────────────┐
│ addLog()       │
│ Log Event      │
└────────────────┘
```

---

## Service Layer

### Gemini Service

```typescript
// src/services/gemini.ts

// Client initialization
getGeminiClient() → GoogleGenAI

// Main generation function
generateAgentResponse(
  config: AgentConfig,
  prompt: string,
  onStream?: callback
) → Promise<GenerationResult>

// Internal functions
executeGeneration()       // Execute with model
buildGenerationConfig()   // Build config object
buildEffectivePrompt()    // Add search context
getModelFallbackChain()   // Get fallback order

// Utilities
supportsThinking(model)   // Check thinking support
supportsSearch(model)     // Check search support
testApiConnection()       // Test API key
```

### Service Patterns

```typescript
// Fallback Pattern
for (const model of fallbackChain) {
  try {
    return await executeGeneration(model, config, prompt);
  } catch (error) {
    if (isNonRetryableError(error)) throw error;
    continue;
  }
}

// Streaming Pattern
const result = await ai.models.generateContentStream({...});
for await (const chunk of result) {
  onStream(fullText += chunk.text);
}
```

---

## Storage Architecture

### localStorage Schema

```typescript
// Key: 'aether_agents'
// Value: Agent[]

interface Agent {
  id: string;
  name: string;
  systemInstruction: string;
  model: ModelType;
  temperature: number;
  useSearch: boolean;
  searchQuery?: string;
  thinkingBudget: number;
  safetyFilters?: boolean;
  health?: number;
}
```

### IndexedDB Schema (Dexie)

```typescript
// Database: 'AetherSecureStorage'
// Store: 'keys'

interface KeyEntry {
  provider: string;  // Primary key
  key: string;       // API key value
}

// Schema definition
db.version(1).stores({
  keys: 'provider'
});
```

### Storage Access Patterns

```typescript
// Read agents
const agents = JSON.parse(localStorage.getItem('aether_agents') || '[]');

// Write agents
localStorage.setItem('aether_agents', JSON.stringify(agents));

// Read API key
const key = await db.keys.get(provider);

// Write API key
await db.keys.put({ provider, key });
```

---

## PWA Architecture

### Service Worker

```javascript
// sw.js - Basic caching strategy

// Cache name
const CACHE_NAME = 'aether-v1';

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        // Add static assets
      ]);
    })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

### Web Manifest

```json
{
  "name": "Aether Agentic IDE",
  "short_name": "Aether",
  "display": "standalone",
  "theme_color": "#020617",
  "background_color": "#020617",
  "start_url": "/",
  "scope": "/",
  "permissions": ["camera", "microphone"]
}
```

---

## Security Architecture

### API Key Protection

```
┌─────────────────────────────────────────────────────────┐
│                    BUILD TIME                            │
│  .env                      vite.config.ts               │
│  GEMINI_API_KEY=xxx   →   process.env.API_KEY           │
│  (not committed)          (injected into bundle)        │
└─────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────┐
│                    RUNTIME                               │
│  process.env.API_KEY  →  GoogleGenAI({ apiKey })        │
│  (available in code)      (used for API calls)          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 USER API KEYS                            │
│  User Input  →  IndexedDB  →  Context  →  API Calls     │
│  (masked)       (encrypted)   (memory)    (headers)     │
└─────────────────────────────────────────────────────────┘
```

### Security Measures

| Measure | Implementation |
|---------|----------------|
| **Env vars** | API key not in source |
| **IndexedDB** | Encrypted at rest (browser) |
| **No logs** | Keys never logged |
| **Masked display** | `sk-...***...xyz` |
| **HTTPS** | Required for PWA |

---

## Future Architecture

### Planned Improvements

#### 1. Server-Side Rendering (Optional)

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│    Edge     │────▶│   Gemini    │
│   Browser   │     │   Function  │     │    API      │
└─────────────┘     └─────────────┘     └─────────────┘
```

#### 2. Real-Time Collaboration

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User A    │────▶│  WebSocket  │────▶│   User B    │
│             │◀────│   Server    │◀────│             │
└─────────────┘     └─────────────┘     └─────────────┘
```

#### 3. Plugin Architecture

```typescript
interface AetherPlugin {
  id: string;
  name: string;
  version: string;
  hooks: {
    onAgentCreate?: (agent: Agent) => Agent;
    onMessageSend?: (message: Message) => Message;
    onWorkflowExecute?: (nodes: WorkflowNode[]) => void;
  };
}
```

### Migration Path

1. **v0.1.0** → Current hybrid structure
2. **v1.0.0** → Full `src/` migration, testing
3. **v1.5.0** → Plugin system, collaboration
4. **v2.0.0** → Optional server components

---

*Last updated: December 2024*
