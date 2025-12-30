# Aether Agentic IDE - Architecture Documentation

System architecture, design decisions, and technical implementation details.

## System Overview

Aether is a **Progressive Web Application (PWA)** for orchestrating multiple AI agents, built with modern web technologies and designed for scalability and extensibility.

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Aether Agentic IDE                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Presentation Layer (React)              │   │
│  │  - Components (UI)                                   │   │
│  │  - Views (Canvas, Chat, Metrics, Orchestration)     │   │
│  │  - Contexts (State Management)                       │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                     │
│  ┌──────────────────────▼───────────────────────────────┐   │
│  │              Business Logic Layer                     │   │
│  │  - Agent Management                                   │   │
│  │  - Workflow Orchestration                            │   │
│  │  - Metrics Tracking                                   │   │
│  │  - Command Processing                                 │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                     │
│  ┌──────────────────────▼───────────────────────────────┐   │
│  │              Service Layer                            │   │
│  │  - geminiService (AI API)                            │   │
│  │  - Error Handling                                     │   │
│  │  - Model Fallbacks                                    │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                     │
│  ┌──────────────────────▼───────────────────────────────┐   │
│  │           Persistence Layer                           │   │
│  │  - localStorage (Agents)                              │   │
│  │  - IndexedDB/Dexie (API Keys)                        │   │
│  └──────────────────────┬───────────────────────────────┘   │
│                         │                                     │
└─────────────────────────┼─────────────────────────────────────┘
                          │
                ┌─────────▼─────────┐
                │   External APIs   │
                │  - Google Gemini  │
                └───────────────────┘
```

## Technology Stack

### Core Technologies

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| UI Framework | React | 19.2.3 | Component-based UI |
| Language | TypeScript | 5.8.2 | Type safety |
| Build Tool | Vite | 6.2.0 | Fast dev/build |
| Styling | Tailwind CSS | (via PostCSS) | Utility-first CSS |
| AI API | @google/genai | 1.34.0 | Gemini integration |
| Storage | Dexie | 4.0.11 | IndexedDB wrapper |
| Charts | Recharts | 3.6.0 | Metrics visualization |
| Icons | Lucide React | 0.562.0 | Icon library |

### Development Tools

- **Package Manager**: npm
- **Type Checking**: TypeScript compiler
- **Hot Reload**: Vite HMR
- **PWA**: Service Worker + Manifest

## Component Architecture

### Component Hierarchy

```
App.tsx
├── ApiKeysProvider (Context)
├── Sidebar
│   └── Agent List Items
├── Main Content (Router)
│   ├── ChatView
│   │   └── ChatMessage[]
│   ├── CanvasView
│   │   ├── WorkflowNode[]
│   │   └── WorkflowEdge[]
│   ├── MetricsView
│   │   └── Charts
│   ├── ApiTerminal
│   └── OrchestrationView
│       └── AgentCard[]
├── SystemTerminal
└── AgentControlPanel (Conditional)
```

### Component Responsibilities

#### App.tsx (Root)
- **State Management**: Agents, metrics, logs, active tab
- **Agent CRUD**: Create, update, delete operations
- **Health Monitoring**: Simulated health updates
- **Command Processing**: Terminal command handling
- **Persistence**: localStorage sync

#### Sidebar
- **Navigation**: Tab switching
- **Agent List**: Display active agents
- **Quick Actions**: Add agent, view status

#### ChatView
- **Conversation UI**: Message display
- **User Input**: Message submission
- **Streaming**: Real-time response display
- **Metrics**: Track latency and tokens

#### CanvasView
- **Visual Editor**: Drag-and-drop workflow builder
- **Node Management**: Add, configure, connect nodes
- **Templates**: Pre-built workflow blueprints
- **Simulation**: Visual execution preview

#### MetricsView
- **Visualization**: Charts for performance data
- **Historical Data**: Track metrics over time

#### OrchestrationView
- **Agent Dashboard**: Grid view of all agents
- **Bulk Operations**: Manage multiple agents
- **Health Overview**: System-wide status

## Data Flow

### Agent Creation Flow

```
User Click "Add Agent"
  ↓
handleAddAgent()
  ↓
Create new Agent object
  ↓
setAgents([...agents, newAgent])
  ↓
useEffect → localStorage.setItem('aether_agents', ...)
  ↓
setActiveAgentId(newId)
  ↓
UI Updates
```

### Chat Message Flow

```
User submits message
  ↓
handleSubmit()
  ↓
Add user message to state
  ↓
Create empty assistant message
  ↓
generateAgentResponse(config, prompt, onStream)
  ↓
geminiService API call
  ↓
Stream chunks → onStream callback
  ↓
Update assistant message in state
  ↓
Update metrics
  ↓
Log to terminal
```

### Workflow Execution Flow

```
User clicks "Deploy" on canvas
  ↓
runSimulation()
  ↓
For each node in sequence:
  ├─ Set status: 'running'
  ├─ Wait 1 second (simulated)
  └─ Set status: 'success'
  ↓
Complete
```

## State Management

### Local State (useState)

```typescript
// App.tsx - Primary state
const [agents, setAgents] = useState<Agent[]>([]);
const [activeTab, setActiveTab] = useState('canvas');
const [activeAgentId, setActiveAgentId] = useState<string>('core-01');
const [metrics, setMetrics] = useState<InferenceMetric[]>([]);
const [logs, setLogs] = useState<LogEntry[]>([]);
const [isTerminalOpen, setIsTerminalOpen] = useState(false);
```

### Context API

```typescript
// ApiKeysContext - Global API key management
interface ApiKeysContextType {
  keys: ApiKeyState;
  setKey: (provider: string, key: string) => Promise<void>;
  removeKey: (provider: string) => Promise<void>;
  isLoading: boolean;
}
```

### Persistence Strategy

**localStorage** (Synchronous):
- Agent configurations
- User preferences
- Session data

**IndexedDB** (Asynchronous via Dexie):
- API keys (secure)
- Large data sets
- Offline data

## Service Layer

### geminiService.ts

**Purpose**: Abstracts Gemini API interactions

**Key Functions**:

```typescript
// Initialize client
getGeminiClient(): GoogleGenAI

// Generate response with streaming
generateAgentResponse(
  config: AgentConfig,
  prompt: string,
  onStream?: (chunk: string) => void
): Promise<{
  text: string;
  grounding?: any[];
  latency: number;
  modelUsed: string;
}>
```

**Features**:
- Model fallback chain
- Error handling
- Streaming support
- Search grounding integration
- Thinking budget configuration

## Routing & Navigation

### Tab-Based Navigation

```typescript
// No React Router - Manual tab switching
const [activeTab, setActiveTab] = useState('canvas');

// Conditional rendering
{activeTab === 'chat' && <ChatView />}
{activeTab === 'canvas' && <CanvasView />}
{activeTab === 'metrics' && <MetricsView />}
{activeTab === 'terminal' && <ApiTerminal />}
{activeTab === 'orchestration' && <OrchestrationView />}
```

**Rationale**: Single-page app, no URL routing needed

## PWA Architecture

### Service Worker (sw.js)

```javascript
// Cache-first strategy
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
```

### Manifest (manifest.json)

```json
{
  "name": "Aether Agentic IDE",
  "short_name": "Aether",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#4f46e5",
  "background_color": "#0f172a",
  "icons": [...]
}
```

**Features**:
- Installable on desktop/mobile
- Offline capability
- Native-like experience
- Push notifications (future)

## Security Architecture

### API Key Management

```
User Input → ApiKeysContext → Dexie (IndexedDB) → Encrypted storage
                                     ↓
                         Never sent to localStorage
                         Never exposed in logs
```

**Security Measures**:
- Environment variable injection
- IndexedDB encryption at rest
- No client-side key exposure
- Secure context (HTTPS) required

### Content Security Policy

**Recommended Headers** (deployment):
```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  connect-src 'self' https://generativelanguage.googleapis.com;
  img-src 'self' data: https:;
```

## Performance Optimizations

### Current Optimizations

1. **React 19 Features**
   - Concurrent rendering
   - Automatic batching
   - Transitions

2. **Vite Build**
   - Code splitting
   - Tree shaking
   - Minification

3. **Lazy Loading**
   - Components loaded on demand
   - Icons imported individually

### Planned Optimizations

1. **React.lazy()** for route-based code splitting
2. **useMemo/useCallback** for expensive computations
3. **Virtual scrolling** for large lists
4. **Service worker caching** strategy
5. **CDN** for static assets

## Error Handling

### Error Boundaries

**Current**: No global error boundary

**Planned**:
```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    logError(error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

### API Error Handling

```typescript
try {
  const result = await generateAgentResponse(...);
} catch (error) {
  // Model fallback chain
  if (/* retriable */) {
    return tryFallbackModel();
  }
  
  // User notification
  addLog('error', 'API', error.message);
  
  // Update UI
  setError(error);
}
```

## Monitoring & Observability

### Current Metrics

1. **Agent Health**: 0-100 score (simulated)
2. **Latency**: Response time per request
3. **Tokens**: Estimated token usage
4. **Logs**: System events with levels

### Planned Monitoring

1. **Real-time metrics**: Actual performance data
2. **Error tracking**: Sentry integration
3. **Analytics**: User behavior tracking
4. **Alerts**: Performance thresholds

## Scalability Considerations

### Current Limitations

- **Client-side only**: No backend server
- **Single user**: No multi-tenancy
- **Local storage**: Limited capacity (5-10MB)
- **No load balancing**: Direct API calls

### Scaling Strategy

**Phase 1** (Current): Client-side PWA
- ✅ Good for: Individual users, demos
- ❌ Limited by: Browser storage, API rate limits

**Phase 2** (v0.4.0): Hybrid architecture
- Add backend for: Auth, storage, rate limiting
- Keep frontend: React PWA
- Introduce: Database, caching layer

**Phase 3** (v1.0.0): Enterprise-ready
- Multi-tenant architecture
- Distributed system
- Microservices
- Auto-scaling infrastructure

## Testing Strategy

### Current State
- ❌ No automated tests
- ✅ Manual testing

### Planned Strategy

```
Unit Tests (70%)
├── Services (geminiService.ts)
├── Utils (helpers, formatters)
└── Hooks (custom React hooks)

Integration Tests (20%)
├── Component interactions
├── API mocking (MSW)
└── State management flows

E2E Tests (10%)
├── Critical user paths
├── Workflow creation
└── Agent management
```

**Tools**: Vitest, React Testing Library, Playwright

## Deployment Architecture

### Development

```
Local Machine
  ↓
npm run dev (Vite dev server)
  ↓
localhost:5173
```

### Production

```
Source Code
  ↓
npm run build (Vite build)
  ↓
dist/ (static files)
  ↓
Deploy to:
  - Vercel
  - Netlify
  - GitHub Pages
  - AWS S3 + CloudFront
```

**Requirements**:
- Static file hosting
- HTTPS (required for PWA)
- Environment variables support
- SPA routing (fallback to index.html)

## Future Architecture Evolution

### v0.2.0 - Modularization

```
src/
├── features/
│   ├── agents/
│   ├── canvas/
│   ├── metrics/
│   └── terminal/
├── hooks/
├── utils/
└── lib/
```

### v0.4.0 - Backend Integration

```
Frontend (React PWA)
  ↔ 
Backend API (Node.js/Express)
  ↔
Database (PostgreSQL)
  ↔
Redis (Caching)
```

### v1.0.0 - Microservices

```
Frontend ↔ API Gateway
              ├→ Auth Service
              ├→ Agent Service
              ├→ Workflow Service
              ├→ Metrics Service
              └→ Storage Service
```

## Design Decisions

### Why React?
- ✅ Large ecosystem
- ✅ Excellent TypeScript support
- ✅ Modern features (React 19)
- ✅ Component reusability

### Why Vite?
- ✅ Fast dev server
- ✅ Modern build tool
- ✅ Excellent DX
- ✅ Native ESM

### Why Tailwind CSS?
- ✅ Utility-first approach
- ✅ Fast development
- ✅ Consistent design
- ✅ Small bundle size

### Why localStorage + IndexedDB?
- ✅ No backend required
- ✅ Offline-first
- ✅ Quick MVP
- ❌ Limited scalability

### Why No State Management Library?
- ✅ Simple requirements
- ✅ React state sufficient
- ✅ Context API for global state
- 🔄 May add Zustand/Redux later

## Contributing to Architecture

### Before Making Changes

1. Read this document
2. Understand current architecture
3. Consider impact on scalability
4. Discuss major changes in issues

### Architecture Decision Records (ADRs)

Planned for v0.2.0 - Document significant decisions

```
docs/adr/
├── 001-react-state-management.md
├── 002-api-error-handling.md
└── 003-testing-strategy.md
```

## Resources

- [React 19 Docs](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)
- [Gemini API Docs](https://ai.google.dev/docs)

---

*Last Updated: December 29, 2024*  
*Architecture Version: 1.0*
