# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive testing infrastructure with Vitest + React Testing Library
- Test coverage configuration (70% target for lines, functions, branches, statements)
- Test utilities and helpers in `/test/utils/`
- Mock fixtures for reusable test data in `/test/fixtures/`
- Test setup file with global mocks (localStorage, Service Worker, API keys)
- Example tests for:
  - `geminiService` - API service layer tests
  - `ApiKeysContext` - Context provider tests (8/8 passing)
  - `AgentControlPanel` - Component tests (6/10 passing)
- Test scripts in package.json (`test`, `test:watch`, `test:ui`, `test:coverage`)
- Testing documentation in `TESTING.md`
- Updated README with testing section

### Changed
- N/A

### Fixed
- N/A

### Security
- Tests verify API keys are never logged
- Tests verify input sanitization patterns
- Tests mock external APIs to prevent credential leakage

## [0.0.0] - 2025-01-08

### Added
- Initial release of Aether Agentic IDE
- React 19 + TypeScript + Vite build system
- Multi-agent orchestration with Gemini API integration
- PWA support with Service Worker
- Local persistence with Dexie/IndexedDB
- Real-time command terminal
- Workflow canvas with visual node orchestration
- Metrics and telemetry dashboard
- Agent configuration panel with temperature, search, and thinking budget controls
