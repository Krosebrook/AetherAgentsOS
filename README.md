# AetherAgentsOS

<div align="center">

![AetherAgentsOS Banner](https://img.shields.io/badge/AetherAgentsOS-v0.1.0-indigo?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWdvbiBwb2ludHM9IjEzIDIgMyAxNCAzIDIyIDEyIDE0IDIxIDIyIDIxIDE0IDEzIDIiLz48L3N2Zz4=)

**High-performance orchestration platform for multi-modal AI agents**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?logo=vite)](https://vitejs.dev)
[![Gemini](https://img.shields.io/badge/Gemini-3-4285f4?logo=google)](https://ai.google.dev)

[Features](#features) | [Quick Start](#quick-start) | [Documentation](#documentation) | [Architecture](#architecture) | [Roadmap](#roadmap)

</div>

---

## Overview

AetherAgentsOS is a Progressive Web Application (PWA) for orchestrating, managing, and monitoring multi-modal AI agents powered by Google's Gemini models. Built with React 19 and TypeScript, it provides an IDE-like interface for:

- **Multi-Agent Management** - Create, configure, and monitor multiple AI agent instances
- **Visual Workflow Design** - Canvas-based workflow builder with industrial templates
- **Real-time Inference** - Streaming responses with thinking budget and search grounding
- **Performance Metrics** - Live telemetry for latency and token throughput
- **System Terminal** - CLI-like interface for advanced operations

## Features

### Core Capabilities

| Feature | Description |
|---------|-------------|
| **Agent Orchestration** | Manage multiple AI agents with health monitoring and configuration |
| **Workflow Engine** | Visual canvas for designing agent workflows with pre-built templates |
| **Chat Interface** | Real-time streaming chat with search grounding and extended thinking |
| **Metrics Dashboard** | Live visualization of inference latency and token density |
| **API Terminal** | Multi-provider API testing with credential vault |
| **System Console** | Integrated CLI for system-level operations |

### AI Model Support

- **Gemini 3 Flash** - High speed, balanced latency
- **Gemini 3 Pro** - Advanced reasoning and complex logic
- **Gemini Flash Lite** - Optimized for efficiency
- **Imagen 4.0** - Image generation capabilities
- Search grounding with web results
- Extended thinking budget up to 32K tokens

### Technical Stack

```
Frontend:     React 19 + TypeScript 5.8
Build:        Vite 6.2
Styling:      Tailwind CSS
Charts:       Recharts 3.6
Icons:        Lucide React
AI:           @google/genai (Gemini SDK)
Storage:      Dexie (IndexedDB) + localStorage
PWA:          Service Worker + Web Manifest
```

## Quick Start

### Prerequisites

- Node.js 18+ or Bun
- Google AI API key ([Get one here](https://aistudio.google.com/app/apikey))

### Installation

```bash
# Clone the repository
git clone https://github.com/Krosebrook/AetherAgentsOS.git
cd AetherAgentsOS

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your Gemini API key
echo "GEMINI_API_KEY=your_api_key_here" > .env

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes |

## Architecture

```
AetherAgentsOS/
├── src/
│   ├── components/          # React components
│   │   ├── ui/              # Base UI components
│   │   ├── shared/          # Shared components (ErrorBoundary)
│   │   └── features/        # Feature-specific components
│   ├── features/            # Domain modules
│   │   ├── agents/          # Agent management
│   │   ├── chat/            # Chat interface
│   │   ├── canvas/          # Workflow editor
│   │   ├── metrics/         # Telemetry dashboard
│   │   ├── orchestration/   # Node manager
│   │   └── terminal/        # System console
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API and external services
│   ├── contexts/            # React Context providers
│   ├── types/               # TypeScript types
│   ├── constants/           # Application constants
│   └── utils/               # Utility functions
├── components/              # Legacy components (migrating to src/)
├── services/                # Legacy services
├── contexts/                # Legacy contexts
└── types.ts                 # Legacy types
```

### Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User UI   │────▶│   Hooks     │────▶│  Services   │
│ (Components)│     │ (useAgents) │     │  (gemini)   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       │                   ▼                   │
       │            ┌─────────────┐            │
       │            │   Context   │            │
       │            │ (ApiKeys)   │            │
       │            └─────────────┘            │
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────┐
│                    Storage Layer                     │
│         (localStorage + IndexedDB/Dexie)            │
└─────────────────────────────────────────────────────┘
```

## CLI Commands

Access the system terminal (`CTRL + ~`) and use these commands:

| Command | Description |
|---------|-------------|
| `nodes` | List all active agent instances |
| `deploy [name]` | Provision a new agent node |
| `status` | Check global system health |
| `clear` | Purge log history |
| `help` | Display available commands |

## Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design and component interactions |
| [AGENTS.md](AGENTS.md) | Agent system documentation |
| [GEMINI.md](GEMINI.md) | Gemini API integration guide |
| [ROADMAP.md](ROADMAP.md) | Development roadmap to post-MVP |
| [CLAUDE.md](CLAUDE.md) | AI assistant development guide |
| [CHANGELOG.md](CHANGELOG.md) | Version history and changes |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines |
| [SECURITY.md](SECURITY.md) | Security policies |

## Roadmap

### Current Status: Pre-MVP (v0.1.0)

- [x] Core agent management system
- [x] Chat interface with streaming
- [x] Workflow canvas with templates
- [x] Metrics dashboard
- [x] API terminal with multi-provider support
- [x] System terminal

### Upcoming Milestones

**MVP (v1.0.0)** - Q1 2025
- [ ] Testing infrastructure (Vitest)
- [ ] CI/CD pipelines
- [ ] Error boundaries and resilience
- [ ] Accessibility improvements

**Post-MVP (v1.x)** - Q2 2025
- [ ] Agent collaboration protocols
- [ ] Workflow persistence and sharing
- [ ] Real-time multi-user sessions
- [ ] Plugin system architecture

See [ROADMAP.md](ROADMAP.md) for the complete development plan.

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (when available)
5. Commit with conventional commits (`git commit -m 'feat: add amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Security

API keys are handled securely:
- Environment variables for server-side injection
- IndexedDB (via Dexie) for client-side secure storage
- No keys exposed in client bundles or logs

See [SECURITY.md](SECURITY.md) for vulnerability reporting.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with precision by the Aether team**

[Report Bug](https://github.com/Krosebrook/AetherAgentsOS/issues) | [Request Feature](https://github.com/Krosebrook/AetherAgentsOS/issues)

</div>
