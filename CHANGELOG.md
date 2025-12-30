# Changelog

All notable changes to AetherAgentsOS will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Modular `src/` directory structure for better scalability
- Comprehensive TypeScript type definitions in `src/types/`
- Application constants centralized in `src/constants/`
- Utility functions library in `src/utils/`
- Custom React hooks (`useAgents`, `useLogger`, `useMetrics`)
- Error Boundary component for graceful error handling
- Refactored Gemini service with improved error handling
- Complete documentation suite (CLAUDE.md, AGENTS.md, GEMINI.md, ARCHITECTURE.md, ROADMAP.md)

### Changed
- Upgraded project structure to feature-based architecture
- Enhanced type safety throughout the codebase
- Improved error messages with actionable remediation guidance

### Fixed
- Edge cases in agent health monitoring
- Token estimation calculation
- API key validation logic

## [0.1.0] - 2024-12-30

### Added
- **Core Platform**
  - React 19 + TypeScript 5.8 foundation
  - Vite 6.2 build system
  - Tailwind CSS styling with dark theme
  - PWA capabilities (Service Worker, Web Manifest)

- **Agent System**
  - Multi-agent instance management
  - Agent configuration panel (model, temperature, thinking budget)
  - Health monitoring with simulated fluctuation
  - Search grounding toggle with custom queries
  - Safety filters configuration

- **Chat Interface**
  - Real-time streaming responses
  - Thinking state visualization
  - Grounding URL display
  - Message history per agent

- **Workflow Engine**
  - Canvas-based visual editor
  - Drag-and-drop node positioning
  - Edge connections between nodes
  - Industrial templates:
    - Autonomous Researcher
    - Security Auditor
  - Node types: Agent, Tool, Guardrail, Code, Docs, Trigger
  - Workflow simulation mode

- **Metrics Dashboard**
  - Real-time latency tracking
  - Token throughput visualization
  - Area charts for inference density
  - Line charts for latency profiles
  - Statistics cards (current, average, total)

- **API Terminal**
  - Multi-provider credential vault (18+ providers)
  - Direct Gemini inference testing
  - Anthropic parallel inference with Gemini audit
  - Command parsing with argument support
  - Actionable error diagnostics

- **System Terminal**
  - Collapsible CLI interface
  - Log display with severity levels
  - Commands: nodes, deploy, status, clear, help
  - Timestamp formatting
  - Color-coded log levels

- **State Management**
  - Context API for API keys
  - IndexedDB storage via Dexie
  - localStorage for agent persistence

- **UI/UX**
  - Sidebar navigation with agent selector
  - Tab-based view switching
  - Lucide icon integration
  - Responsive layout
  - Dark mode design

### Models Supported
- Gemini 3 Flash Preview
- Gemini 3 Pro Preview
- Gemini Flash Lite
- Gemini 2.5 Flash Image
- Imagen 4.0 Generate

### Dependencies
- react: ^19.2.3
- react-dom: ^19.2.3
- @google/genai: ^1.34.0
- recharts: ^3.6.0
- lucide-react: ^0.562.0
- dexie: ^4.0.11
- typescript: ~5.8.2
- vite: ^6.2.0

## [0.0.0] - 2024-12-28

### Added
- Initial repository setup
- Basic project scaffolding
- MIT License

---

## Version History Summary

| Version | Date | Highlights |
|---------|------|------------|
| 0.1.0 | 2024-12-30 | Core platform with agents, chat, canvas, metrics, terminals |
| 0.0.0 | 2024-12-28 | Initial commit |

## Upgrade Guide

### From 0.0.0 to 0.1.0

No breaking changes. This is the initial feature release.

### Future Breaking Changes

The following changes are planned for future versions:

1. **v1.0.0**: Components will be migrated from `/components/` to `/src/components/`
2. **v1.0.0**: Types will be consolidated in `/src/types/`
3. **v1.0.0**: Testing infrastructure will be added (Vitest)

---

[Unreleased]: https://github.com/Krosebrook/AetherAgentsOS/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/Krosebrook/AetherAgentsOS/compare/v0.0.0...v0.1.0
[0.0.0]: https://github.com/Krosebrook/AetherAgentsOS/releases/tag/v0.0.0
