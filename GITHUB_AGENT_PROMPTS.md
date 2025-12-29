# GitHub Agent Prompts for Aether Agentic IDE

This document contains 5 context-engineered prompts designed for GitHub Agents and 1 comprehensive prompt for GitHub Copilot. These prompts are crafted following 2024 best practices for prompt engineering with explicit context, clear constraints, and actionable deliverables.

---

## Understanding These Prompts

### Prompt Engineering Principles Applied

1. **Single Focus**: Each prompt addresses one clear objective
2. **Specific Context**: Includes project details, tech stack, current state
3. **Short & Clear**: Concise language with structured format
4. **Surrounding Context**: References files, patterns, and dependencies

### How to Use These Prompts

- Copy the entire prompt including context sections
- Adjust PROJECT_ROOT paths if needed
- Add or remove constraints based on your priorities
- Use as GitHub Issue descriptions or in GitHub Copilot Workspace

---

## Prompt 1: Testing Infrastructure Setup Agent

### Role & Expertise
```
You are a senior test engineer specializing in React TypeScript applications with expertise in Vitest, React Testing Library, and modern testing best practices for 2024-2025.
```

### Project Context
```
PROJECT: Aether Agentic IDE
PURPOSE: PWA for orchestrating multiple Gemini AI agents
TECH_STACK:
  - React 19.2.3
  - TypeScript 5.8.2
  - Vite 6.2.0
  - Tailwind CSS
  - @google/genai (Gemini API)
  - Dexie (IndexedDB)
  - Recharts (visualizations)
  - Lucide React (icons)

CURRENT_STATE:
  - No testing infrastructure exists
  - No test files present
  - No testing dependencies installed
  - No test scripts in package.json

PROJECT_ROOT: /home/runner/work/AetherAgentsOS/AetherAgentsOS
```

### Task Definition
```
Set up a complete, production-ready testing infrastructure for the project.

DELIVERABLES:
1. Install and configure Vitest as the test runner
2. Install React Testing Library and @testing-library/jest-dom
3. Install @testing-library/user-event for interaction testing
4. Install MSW (Mock Service Worker) for API mocking
5. Create vitest.config.ts with proper jsdom environment setup
6. Create src/test/setup.ts for global test configuration
7. Create src/test/utils.tsx with custom render function
8. Add test scripts to package.json:
   - "test": "vitest"
   - "test:ui": "vitest --ui"
   - "test:coverage": "vitest --coverage"
   - "test:run": "vitest run"
9. Create .gitignore entries for coverage directories
10. Create example test files demonstrating best practices
```

### Example Tests Required
```
Create these example tests showing different testing scenarios:

1. src/components/__tests__/ChatView.test.tsx
   - Test: renders chat interface
   - Test: displays messages from agent
   - Test: sends user message on button click
   - Test: handles API errors gracefully
   - Test: shows loading state during inference

2. src/components/__tests__/AgentControlPanel.test.tsx
   - Test: displays current agent configuration
   - Test: updates temperature slider value
   - Test: toggles search feature
   - Test: saves agent configuration
   - Test: validates system instruction input

3. src/services/__tests__/geminiService.test.ts
   - Test: creates chat session with correct config
   - Test: handles streaming responses
   - Test: formats grounding data correctly
   - Test: throws error on invalid API key
   - Mock all Gemini API calls using MSW
```

### Configuration Requirements
```
vitest.config.ts MUST include:
- globals: true (for global test APIs)
- environment: 'jsdom' (for DOM testing)
- setupFiles: ['./src/test/setup.ts']
- css: true (process CSS imports)
- coverage: {
    provider: 'v8',
    reporter: ['text', 'json', 'html'],
    exclude: ['node_modules/', 'src/test/']
  }

setup.ts MUST include:
- import '@testing-library/jest-dom'
- afterEach cleanup
- global test utilities
- MSW server setup and handlers
```

### Testing Standards
```
FOLLOW THESE PRACTICES:
- Query Priority: getByRole > getByLabelText > getByPlaceholderText > getByText
- User Interactions: Use userEvent, not fireEvent
- Async Operations: Use waitFor, findBy queries
- Assertions: Use jest-dom matchers (toBeInTheDocument, toHaveAttribute)
- Test Structure: AAA pattern (Arrange, Act, Assert)
- Test Names: "it should..." format describing user behavior
- Mocking: Mock external dependencies, not implementation details

AVOID:
- Testing implementation details (state, props directly)
- Using container.querySelector (use queries instead)
- Testing third-party libraries
- Large, multi-assertion tests
```

### Constraints
```
- Use Vitest, NOT Jest (optimized for Vite projects)
- Follow React Testing Library philosophy (test user behavior)
- Keep individual tests under 100ms
- Target >70% code coverage on critical paths
- All tests must pass before completion
- Do not modify existing component logic
- Ensure dev server still runs after changes
```

### Success Criteria
```
✅ npm run test executes successfully
✅ All example tests pass
✅ npm run test:ui opens Vitest UI
✅ npm run test:coverage generates coverage report
✅ Documentation added to README.md (Testing section)
✅ Examples demonstrate mocking, async, user interaction
✅ Project builds successfully: npm run build
```

### Documentation Required
```
Update README.md with:
## Testing

### Running Tests
- `npm test` - Run tests in watch mode
- `npm run test:ui` - Open Vitest UI in browser
- `npm run test:coverage` - Generate coverage report
- `npm run test:run` - Run tests once (CI mode)

### Writing Tests
- Place tests in `__tests__` directories next to source files
- Use React Testing Library queries
- Mock API calls using MSW
- Follow the examples in `src/components/__tests__/`

### Coverage Goals
- Critical paths (agent creation, message sending): >80%
- UI components: >70%
- Utility functions: >90%
```

---

## Prompt 2: Documentation Enhancement Agent

### Role & Expertise
```
You are a technical documentation specialist for open-source projects with expertise in software architecture documentation, API documentation, and developer onboarding.
```

### Project Context
```
PROJECT: Aether Agentic IDE
PURPOSE: Multi-agent AI orchestration platform (PWA)
TARGET_AUDIENCE: 
  - Developers building AI agent systems
  - Contributors to the project
  - Researchers exploring multi-agent orchestration

CURRENT_DOCUMENTATION:
  - README.md (basic, 27 lines)
  - No architecture documentation
  - No API documentation
  - No contribution guidelines
  - No deployment instructions

TECH_STACK: React 19, TypeScript, Vite, Gemini API, PWA
PROJECT_ROOT: /home/runner/work/AetherAgentsOS/AetherAgentsOS
```

### Task Definition
```
Create a comprehensive documentation suite that enables developers to understand, use, and contribute to the project effectively.

DELIVERABLES:
1. ARCHITECTURE.md - System design and data flow
2. CONTRIBUTING.md - Contribution guidelines
3. API.md - Service and component API documentation
4. DEPLOYMENT.md - Deployment instructions
5. Enhanced README.md - Quick start and overview
6. docs/ directory with:
   - agent-guide.md (creating and managing agents)
   - workflow-templates.md (using workflow system)
   - security.md (API key handling, best practices)
   - troubleshooting.md (common issues and solutions)
7. .github/ directory with:
   - ISSUE_TEMPLATE/bug_report.md
   - ISSUE_TEMPLATE/feature_request.md
   - PULL_REQUEST_TEMPLATE.md
```

### ARCHITECTURE.md Requirements
```
SECTIONS REQUIRED:
1. System Overview
   - High-level purpose and capabilities
   - Key features and benefits
   - Target use cases

2. Architecture Diagram (Mermaid)
   - Component relationships
   - Data flow
   - External integrations

3. Core Components
   - App.tsx - Main application orchestrator
   - Agent System - Agent lifecycle and management
   - Service Layer - API integration (geminiService)
   - Context Providers - Global state management
   - View Components - UI layer organization

4. Data Models
   - Agent interface
   - Message interface
   - Workflow structures
   - State management

5. State Management
   - Local state patterns
   - Context usage
   - LocalStorage persistence
   - Future: IndexedDB with Dexie

6. API Integration
   - Gemini API client (geminiService.ts)
   - Streaming response handling
   - Error handling patterns
   - Rate limiting considerations

7. PWA Architecture
   - Service worker strategy
   - Manifest configuration
   - Offline capabilities
   - Caching strategy

8. Security Architecture
   - API key handling
   - Environment variables
   - No client-side secrets
   - CSP headers

INCLUDE:
- Mermaid diagrams for architecture, data flow, sequence diagrams
- Code examples for key patterns
- Decision records (why certain choices were made)
- Links to relevant code files
```

### CONTRIBUTING.md Requirements
```
SECTIONS REQUIRED:
1. Welcome & Code of Conduct
2. Getting Started
   - Prerequisites
   - Fork and clone
   - Install dependencies
   - Run development server
   - Run tests

3. Development Workflow
   - Create feature branch
   - Make changes
   - Write tests
   - Run linter
   - Commit message conventions
   - Push and create PR

4. Code Standards
   - TypeScript strict mode
   - Component patterns (functional, hooks)
   - Naming conventions
   - File organization
   - Import ordering

5. Testing Requirements
   - Write tests for new features
   - Maintain >70% coverage
   - Test user behavior, not implementation

6. Pull Request Process
   - PR title format
   - Description requirements
   - Review process
   - CI checks required

7. Commit Message Convention
   - Format: type(scope): description
   - Types: feat, fix, docs, style, refactor, test, chore
   - Examples

8. Getting Help
   - Where to ask questions
   - Issue templates
   - Community channels
```

### API.md Requirements
```
DOCUMENT ALL:

1. Services
   - geminiService.ts
     - createChatSession()
     - generateImage()
     - Methods, parameters, return types, examples

2. Context Providers
   - ApiKeysContext
     - Available values
     - How to consume
     - Update methods

3. Key Component APIs
   - AgentControlPanel props
   - ChatView props
   - OrchestrationView props
   - MetricsView props

4. Type Definitions
   - Agent interface
   - Message interface
   - ModelType enum
   - NodeType enum

5. Hooks (if any)
   - Custom hooks
   - Parameters and return values

FORMAT:
For each API:
```typescript
// Code signature
interface Props {
  // ...
}

// Description
// Parameters
// Returns
// Example usage
```
```

### Enhanced README.md Structure
```
UPDATE README.md TO INCLUDE:

# Aether Agentic IDE

[Brief description - keep existing]

[![License](badge)](link)
[![Tests](badge)](link)
[![Coverage](badge)](link)

[Demo GIF or Screenshot]

## ✨ Features

[Expand with bullet points, include:]
- Multi-agent orchestration with health monitoring
- Real-time inference metrics and telemetry
- Visual workflow editor with drag-and-drop
- Integrated terminal for system control
- PWA with offline capabilities
- Gemini 3 Flash/Pro integration

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Gemini API key

### Installation
```bash
# Steps
```

### Running Locally
```bash
# Commands
```

### Building for Production
```bash
# Commands
```

## 📚 Documentation

- [Architecture](./ARCHITECTURE.md)
- [API Reference](./API.md)
- [Contributing](./CONTRIBUTING.md)
- [Deployment](./DEPLOYMENT.md)

## 🛠️ Development

### Project Structure
[Brief overview with tree]

### Available Scripts
[All npm scripts with descriptions]

### Testing
[Link to testing section]

## 🔒 Security

[API key handling, reporting vulnerabilities]

## 🤝 Contributing

[Link to CONTRIBUTING.md]

## 📄 License

[License type]

## 🙏 Acknowledgments

[Credits, inspired by]
```

### Diagrams Required (Mermaid)
```
1. System Architecture Diagram
   - Show component hierarchy
   - External dependencies
   - Data flow

2. Agent Lifecycle Diagram
   - Creation -> Configuration -> Execution -> Monitoring

3. Message Flow Sequence
   - User input -> Agent -> Gemini API -> Response -> UI

4. State Management Diagram
   - Local state, Context, Persistence layer
```

### Style Guide
```
- Use clear, concise, actionable language
- Include code examples for complex concepts
- Use tables for comparing options
- Add "Note" and "Warning" callouts for important info
- Use emoji sparingly for section headers
- Keep paragraphs short (3-4 sentences max)
- Use active voice
- Link between related documents
```

### Success Criteria
```
✅ All required files created
✅ All diagrams render correctly in GitHub
✅ Code examples are syntax-highlighted and correct
✅ Cross-references between docs work
✅ README is under 300 lines but comprehensive
✅ New contributor can get started in <15 minutes
✅ Architecture is clear to someone unfamiliar with the project
```

---

## Prompt 3: Repository Structure Modernization Agent

### Role & Expertise
```
You are a software architect specializing in React application architecture with deep knowledge of bulletproof-react patterns, feature-based architecture, and TypeScript project organization.
```

### Project Context
```
PROJECT: Aether Agentic IDE
CURRENT_STRUCTURE: Flat organization with files in project root
TARGET: Feature-based architecture following bulletproof-react patterns

CURRENT_LAYOUT:
/
├── components/       # All components flat
├── contexts/         # Context providers
├── services/         # API services
├── App.tsx
├── types.ts
├── index.tsx
└── [config files]

PROBLEMS:
- No clear feature boundaries
- Components mixed together regardless of domain
- No separation between shared/feature-specific components
- Custom hooks mixed with components
- Utility functions scattered
- Scales poorly as project grows

GOAL: Feature-based structure that scales
PROJECT_ROOT: /home/runner/work/AetherAgentsOS/AetherAgentsOS
```

### Task Definition
```
Reorganize the project into a modern, scalable feature-based architecture that follows industry best practices while maintaining all existing functionality.

DELIVERABLES:
1. Create new directory structure under src/
2. Move all existing files to appropriate locations
3. Update all imports across the entire codebase
4. Verify application builds and runs correctly
5. Document the new structure
6. Create index.ts barrel exports for cleaner imports
```

### Target Directory Structure
```
Create this structure:

src/
├── assets/
│   ├── images/
│   └── icons/
├── components/
│   ├── ui/              # Base UI components (buttons, inputs)
│   └── shared/          # Shared complex components
├── features/
│   ├── agents/
│   │   ├── components/  # Agent-specific components
│   │   │   ├── AgentControlPanel.tsx
│   │   │   └── OrchestrationView.tsx
│   │   ├── hooks/       # Agent-specific hooks
│   │   ├── types.ts     # Agent-specific types
│   │   └── index.ts     # Barrel export
│   ├── chat/
│   │   ├── components/
│   │   │   └── ChatView.tsx
│   │   ├── hooks/
│   │   └── index.ts
│   ├── canvas/
│   │   ├── components/
│   │   │   └── CanvasView.tsx
│   │   └── index.ts
│   ├── metrics/
│   │   ├── components/
│   │   │   └── MetricsView.tsx
│   │   └── index.ts
│   └── terminal/
│       ├── components/
│       │   ├── SystemTerminal.tsx
│       │   └── ApiTerminal.tsx
│       └── index.ts
├── hooks/               # Global custom hooks
├── lib/                 # Third-party lib configs
│   └── gemini.ts        # Gemini API client wrapper
├── providers/           # Context providers
│   ├── ApiKeysProvider.tsx
│   └── index.ts
├── services/            # API services
│   └── geminiService.ts
├── types/               # Global TypeScript types
│   ├── agent.ts
│   ├── message.ts
│   ├── workflow.ts
│   └── index.ts
├── utils/               # Utility functions
│   ├── formatters.ts
│   └── validators.ts
├── styles/              # Global styles (if any)
├── App.tsx
├── main.tsx
└── vite-env.d.ts

(Keep in root)
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── manifest.json
├── metadata.json
├── sw.js
└── [other config files]
```

### Migration Steps
```
STEP 1: Create Directory Structure
- Create all folders under new src/ directory
- Do NOT delete any files yet

STEP 2: Move Files by Feature
- Identify feature boundaries:
  * agents: AgentControlPanel, OrchestrationView
  * chat: ChatView
  * canvas: CanvasView
  * metrics: MetricsView
  * terminal: SystemTerminal, ApiTerminal
  * shared: Sidebar (cross-feature)
- Move components to respective feature folders

STEP 3: Extract and Organize Types
- Split types.ts into domain-specific files:
  * agent.ts: Agent, AgentConfig, ModelType
  * message.ts: Message
  * workflow.ts: WorkflowNode, WorkflowEdge, WorkflowTemplate
  * metrics.ts: InferenceMetric, LogEntry
  * terminal.ts: TerminalResponse
  * api.ts: ApiKeyState

STEP 4: Move Contexts to Providers
- Rename contexts/ to providers/
- Move ApiKeysContext.tsx to providers/ApiKeysProvider.tsx

STEP 5: Create Barrel Exports
- Create index.ts in each feature folder
- Export all public components/hooks/types
- Example:
  ```typescript
  // src/features/agents/index.ts
  export { AgentControlPanel } from './components/AgentControlPanel';
  export { OrchestrationView } from './components/OrchestrationView';
  export type { Agent, AgentConfig } from './types';
  ```

STEP 6: Update All Imports
- Use automated tools where possible (VS Code refactoring)
- Update imports to use barrel exports:
  * Before: `import { AgentControlPanel } from './components/AgentControlPanel'`
  * After: `import { AgentControlPanel } from '@/features/agents'`
- Verify no circular dependencies

STEP 7: Update tsconfig.json
- Ensure paths are configured:
  ```json
  {
    "compilerOptions": {
      "paths": {
        "@/*": ["./src/*"],
        "@/features/*": ["./src/features/*"],
        "@/components/*": ["./src/components/*"]
      }
    }
  }
  ```

STEP 8: Verify Build
- Run `npm run build`
- Fix any import errors
- Ensure dev server runs: `npm run dev`
- Test key features in browser
```

### Constraints
```
MUST:
- Maintain all existing functionality
- Keep changes surgical and minimal
- Update imports systematically
- Test after each major change
- Create clear feature boundaries

MUST NOT:
- Change component logic or behavior
- Remove or rename exported functions/types
- Break existing API contracts
- Skip verification steps
- Create circular dependencies
```

### Import Update Strategy
```
PRIORITY ORDER:
1. Update App.tsx imports (main entry point)
2. Update each moved component's internal imports
3. Update cross-feature imports to use barrel exports
4. Update config files (vite.config.ts, tsconfig.json)

USE:
- VS Code "Update imports" refactoring when moving files
- Global find/replace for systematic changes
- TypeScript compiler to catch errors

VERIFY:
- npm run build succeeds
- No TypeScript errors
- No missing modules
- Dev server runs without errors
```

### Documentation Required
```
Create MIGRATION.md documenting:

1. New Structure Overview
   - Diagram of new structure
   - Explanation of each directory

2. Feature Organization
   - What constitutes a feature
   - When to create a new feature folder
   - Shared vs feature-specific components

3. Import Conventions
   - Using barrel exports
   - Path aliases
   - Avoiding circular dependencies

4. Adding New Code
   - Where to place new components
   - When to use features/ vs components/
   - Creating new features

5. Benefits
   - Better scalability
   - Clearer boundaries
   - Easier testing
   - Improved maintainability
```

### Success Criteria
```
✅ All files moved to new structure
✅ All imports updated and working
✅ npm run build succeeds
✅ npm run dev runs without errors
✅ Application works identically to before
✅ No console errors or warnings
✅ MIGRATION.md created and complete
✅ All features accessible and functional
✅ TypeScript compilation clean
```

---

## Prompt 4: CI/CD Pipeline Setup Agent

### Role & Expertise
```
You are a DevOps engineer specializing in GitHub Actions, modern CI/CD practices, and automated deployment pipelines for React/TypeScript applications.
```

### Project Context
```
PROJECT: Aether Agentic IDE
TYPE: React TypeScript PWA
HOSTING: GitHub Pages / Vercel / Netlify (target for multiple)
CURRENT_STATE: No CI/CD infrastructure exists

BUILD_TOOLS:
- Vite for bundling
- TypeScript for type checking
- Future: ESLint for linting
- Future: Vitest for testing

REQUIREMENTS:
- Run on every PR
- Deploy on merge to main
- Security scanning
- Status badges for README

PROJECT_ROOT: /home/runner/work/AetherAgentsOS/AetherAgentsOS
GITHUB_REPO: Krosebrook/AetherAgentsOS
```

### Task Definition
```
Create a complete CI/CD pipeline using GitHub Actions that automates testing, security scanning, and deployment.

DELIVERABLES:
1. .github/workflows/ci.yml - Continuous Integration
2. .github/workflows/deploy.yml - Deployment
3. .github/workflows/security.yml - Security scanning
4. .github/dependabot.yml - Automated dependency updates
5. Update README.md with status badges
6. Document CI/CD process in DEPLOYMENT.md
```

### CI Workflow (.github/workflows/ci.yml)
```
CREATE: .github/workflows/ci.yml

TRIGGER:
- On pull_request to main
- On push to main
- On workflow_dispatch (manual)

JOBS:

1. lint (if ESLint configured, otherwise skip)
   - Checkout code
   - Setup Node.js 18.x
   - Cache npm dependencies
   - Install dependencies
   - Run: npm run lint

2. type-check
   - Checkout code
   - Setup Node.js 18.x
   - Cache npm dependencies
   - Install dependencies
   - Run: tsc --noEmit

3. test (if tests exist, otherwise skip)
   - Checkout code
   - Setup Node.js 18.x
   - Cache npm dependencies
   - Install dependencies
   - Run: npm run test:run
   - Upload coverage to Codecov

4. build
   - Checkout code
   - Setup Node.js 18.x
   - Cache npm dependencies
   - Install dependencies
   - Run: npm run build
   - Upload build artifacts

REQUIREMENTS:
- Use actions/checkout@v4
- Use actions/setup-node@v4 with caching
- Run jobs in parallel where possible
- Fail fast on errors
- Add status checks to README

EXAMPLE STRUCTURE:
```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  type-check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: tsc --noEmit

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/
```
```

### Deploy Workflow (.github/workflows/deploy.yml)
```
CREATE: .github/workflows/deploy.yml

TRIGGER:
- On push to main branch only
- After CI workflow completes successfully

DEPLOYMENT TARGETS:
Create separate jobs for each target (at least one):

1. GitHub Pages
   - Checkout code
   - Setup Node.js
   - Install and build
   - Deploy to gh-pages branch
   - Configure Vite base path

2. Vercel (optional, template)
   - Use vercel action
   - Deploy with environment secrets

3. Netlify (optional, template)
   - Use netlify action
   - Deploy with environment secrets

REQUIREMENTS:
- Only run on main branch
- Require CI to pass first
- Set environment variables properly
- Handle base path for GitHub Pages
- Create deployment status

EXAMPLE STRUCTURE:
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-gh-pages:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
        env:
          NODE_ENV: production
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

NOTE: Update vite.config.ts for GitHub Pages:
```typescript
export default defineConfig({
  base: process.env.NODE_ENV === 'production' 
    ? '/AetherAgentsOS/' 
    : '/',
  // ... rest of config
})
```
```

### Security Workflow (.github/workflows/security.yml)
```
CREATE: .github/workflows/security.yml

TRIGGER:
- Schedule: weekly (Monday 9 AM UTC)
- On workflow_dispatch (manual)
- On pull_request (selected checks)

JOBS:

1. dependency-audit
   - Checkout code
   - Setup Node.js
   - Run: npm audit --audit-level=moderate
   - Create issue if vulnerabilities found

2. codeql-analysis
   - Initialize CodeQL for TypeScript
   - Autobuild
   - Perform analysis
   - Upload results to GitHub Security

3. license-check
   - Checkout code
   - Check for license compliance
   - Fail on incompatible licenses

EXAMPLE STRUCTURE:
```yaml
name: Security

on:
  schedule:
    - cron: '0 9 * * 1' # Monday 9 AM UTC
  workflow_dispatch:
  pull_request:
    branches: [main]

jobs:
  dependency-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm audit --audit-level=moderate

  codeql:
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: typescript, javascript
      - uses: github/codeql-action/autobuild@v3
      - uses: github/codeql-action/analyze@v3
```
```

### Dependabot Configuration
```
CREATE: .github/dependabot.yml

CONFIGURE:
- Package ecosystem: npm
- Update schedule: weekly
- Open pull requests for updates
- Group updates by type (dev/prod)

EXAMPLE:
```yaml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
      day: "monday"
    open-pull-requests-limit: 10
    groups:
      production-dependencies:
        dependency-type: "production"
      development-dependencies:
        dependency-type: "development"
```
```

### README Badges
```
UPDATE README.md with status badges at the top:

```markdown
# Aether Agentic IDE

[![CI](https://github.com/Krosebrook/AetherAgentsOS/actions/workflows/ci.yml/badge.svg)](https://github.com/Krosebrook/AetherAgentsOS/actions/workflows/ci.yml)
[![Deploy](https://github.com/Krosebrook/AetherAgentsOS/actions/workflows/deploy.yml/badge.svg)](https://github.com/Krosebrook/AetherAgentsOS/actions/workflows/deploy.yml)
[![Security](https://github.com/Krosebrook/AetherAgentsOS/actions/workflows/security.yml/badge.svg)](https://github.com/Krosebrook/AetherAgentsOS/actions/workflows/security.yml)
[![codecov](https://codecov.io/gh/Krosebrook/AetherAgentsOS/branch/main/graph/badge.svg)](https://codecov.io/gh/Krosebrook/AetherAgentsOS)
```
```

### DEPLOYMENT.md Documentation
```
CREATE: DEPLOYMENT.md

SECTIONS:

1. Deployment Overview
   - Available deployment targets
   - Automatic vs manual deployment
   - Environment requirements

2. GitHub Pages Deployment
   - Automatic on merge to main
   - URL: https://krosebrook.github.io/AetherAgentsOS/
   - Configuration details

3. Manual Deployment
   - Build locally: npm run build
   - Deploy to custom host
   - Environment variables needed

4. Environment Variables
   - VITE_GEMINI_API_KEY (required)
   - NODE_ENV
   - BASE_URL for different hosts

5. CI/CD Pipeline
   - Workflow descriptions
   - How to trigger manually
   - Troubleshooting failed deployments

6. Branch Protection
   - Recommended rules
   - Required status checks
   - Code review requirements
```

### Branch Protection Recommendations
```
DOCUMENT in DEPLOYMENT.md:

Recommended branch protection rules for 'main':
- Require pull request reviews (1 approval)
- Require status checks to pass:
  * type-check
  * build
  * test (when available)
- Require branches to be up to date
- Require signed commits (optional)
- Include administrators (recommended)
```

### Constraints
```
MUST:
- Use latest action versions (@v4, @v3)
- Cache dependencies for speed
- Run jobs in parallel where possible
- Provide clear error messages
- Follow security best practices

MUST NOT:
- Commit secrets or tokens to workflows
- Skip security checks
- Deploy without successful CI
- Use deprecated actions
```

### Success Criteria
```
✅ CI workflow runs on PRs and passes
✅ Type checking enforced
✅ Build succeeds in CI
✅ Deploy workflow deploys to at least one target
✅ Security workflow runs weekly
✅ Dependabot configured and creating PRs
✅ README has status badges
✅ DEPLOYMENT.md complete and accurate
✅ Manual workflow trigger works
✅ GitHub Pages accessible (if configured)
```

---

## Prompt 5: Code Quality & Linting Setup Agent

### Role & Expertise
```
You are a code quality specialist for TypeScript React projects with expertise in ESLint, Prettier, and automated code quality enforcement.
```

### Project Context
```
PROJECT: Aether Agentic IDE
TECH_STACK:
  - React 19
  - TypeScript 5.8
  - Vite 6.2
  - Tailwind CSS

CURRENT_STATE:
  - No ESLint configuration
  - No Prettier configuration
  - No pre-commit hooks
  - No code formatting standards
  - No lint scripts in package.json

GOALS:
  - Enforce consistent code style
  - Catch common bugs and anti-patterns
  - Auto-format on save and commit
  - Integrate with CI/CD

PROJECT_ROOT: /home/runner/work/AetherAgentsOS/AetherAgentsOS
```

### Task Definition
```
Set up comprehensive code quality tools including ESLint, Prettier, and git hooks to enforce standards automatically.

DELIVERABLES:
1. Install and configure ESLint with TypeScript and React
2. Install and configure Prettier
3. Set up husky and lint-staged for git hooks
4. Create .vscode/settings.json for editor integration
5. Create .vscode/extensions.json for recommended extensions
6. Add lint and format scripts to package.json
7. Document code standards
8. Fix existing linting errors (or create .eslintignore if needed)
```

### ESLint Configuration
```
INSTALL:
npm install --save-dev \
  eslint@^8 \
  @typescript-eslint/parser \
  @typescript-eslint/eslint-plugin \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  eslint-plugin-jsx-a11y \
  eslint-plugin-import \
  eslint-config-prettier

CREATE: .eslintrc.cjs

CONFIGURATION:
```javascript
module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier', // Must be last
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    project: './tsconfig.json',
  },
  plugins: [
    'react',
    'react-hooks',
    '@typescript-eslint',
    'jsx-a11y',
    'import',
  ],
  settings: {
    react: {
      version: 'detect',
    },
    'import/resolver': {
      typescript: true,
      node: true,
    },
  },
  rules: {
    // TypeScript
    '@typescript-eslint/no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_' 
    }],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    
    // React
    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    
    // Import
    'import/order': ['warn', {
      'groups': [
        'builtin',
        'external',
        'internal',
        'parent',
        'sibling',
        'index'
      ],
      'newlines-between': 'always',
      'alphabetize': { order: 'asc' }
    }],
    
    // General
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'prefer-const': 'warn',
    'no-unused-expressions': 'warn',
  },
  ignorePatterns: [
    'dist',
    'node_modules',
    '*.config.js',
    '*.config.ts',
    'sw.js',
  ],
};
```

CREATE: .eslintignore
```
dist
node_modules
*.config.js
*.config.ts
sw.js
coverage
.vscode
.github
```
```

### Prettier Configuration
```
INSTALL:
npm install --save-dev prettier

CREATE: .prettierrc
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "avoid",
  "endOfLine": "lf",
  "bracketSpacing": true,
  "jsxSingleQuote": false,
  "jsxBracketSameLine": false
}
```

CREATE: .prettierignore
```
dist
node_modules
coverage
package-lock.json
*.md
```
```

### Git Hooks Setup
```
INSTALL:
npm install --save-dev husky lint-staged

INITIALIZE HUSKY:
npx husky install
npm pkg set scripts.prepare="husky install"

CREATE: .husky/pre-commit
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged

CREATE: .lintstagedrc.json
```json
{
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,css,md}": [
    "prettier --write"
  ]
}
```

EXPLANATION:
- Pre-commit hook runs lint-staged
- lint-staged runs ESLint and Prettier on staged files
- Only formats and lints files being committed
- Fails commit if unfixable errors exist
```

### VS Code Integration
```
CREATE: .vscode/settings.json
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact",
    "typescript",
    "typescriptreact"
  ],
  "typescript.tsdk": "node_modules/typescript/lib",
  "files.eol": "\n",
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true
}
```

CREATE: .vscode/extensions.json
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```
```

### Package.json Scripts
```
ADD to package.json scripts:
```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,json,css,md}\"",
    "type-check": "tsc --noEmit",
    "prepare": "husky install"
  }
}
```
```

### Initial Cleanup
```
AFTER SETUP:

1. Run linting: npm run lint
2. Auto-fix what you can: npm run lint:fix
3. Format all files: npm run format
4. Address remaining errors:
   - Fix TypeScript errors
   - Fix accessibility issues
   - Fix React hook dependencies
5. If too many errors, add to .eslintignore temporarily:
   ```
   # TODO: Fix and remove
   src/components/LegacyComponent.tsx
   ```
6. Verify: npm run lint should have 0 errors
```

### Documentation
```
CREATE: docs/code-standards.md

SECTIONS:

1. Code Style
   - Using ESLint and Prettier
   - Auto-formatting on save
   - Pre-commit hooks

2. TypeScript Standards
   - Use strict type checking
   - Avoid `any` type
   - Define interfaces for all data shapes
   - Use enums for constants

3. React Standards
   - Functional components only
   - Use hooks for state and effects
   - Prop types defined with TypeScript
   - Component file structure

4. Import Organization
   - Group by: builtin, external, internal, relative
   - Alphabetize within groups
   - Blank line between groups

5. Naming Conventions
   - Components: PascalCase
   - Functions: camelCase
   - Constants: UPPER_SNAKE_CASE
   - Files: PascalCase for components, camelCase for utilities

6. Running Quality Checks
   - `npm run lint` - Check for issues
   - `npm run lint:fix` - Auto-fix issues
   - `npm run format` - Format all files
   - `npm run type-check` - TypeScript validation

UPDATE README.md:
## Development

### Code Quality
This project uses ESLint and Prettier for code quality and formatting.

**Scripts:**
- `npm run lint` - Check code for issues
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format all files
- `npm run type-check` - TypeScript type checking

**Editor Setup:**
Install recommended VS Code extensions for automatic formatting on save.
```

### Constraints
```
MUST:
- Use latest stable versions
- Ensure no conflicts between ESLint and Prettier
- Keep rules reasonable (not overly strict)
- Auto-fix where possible
- Integrate with CI/CD

MUST NOT:
- Make rules too strict (blocks development)
- Conflict with existing code patterns unnecessarily
- Slow down commit process significantly
- Require manual fixes for auto-fixable issues
```

### Success Criteria
```
✅ ESLint installed and configured
✅ Prettier installed and configured
✅ Husky and lint-staged working
✅ Pre-commit hook runs and checks staged files
✅ VS Code auto-formats on save
✅ npm run lint completes with 0 errors
✅ npm run format works across project
✅ npm run type-check passes
✅ Git hook prevents committing bad code
✅ Documentation complete
✅ README updated with code quality section
```

---

## GitHub Copilot Comprehensive Prompt

```
# GitHub Copilot - Aether Agentic IDE Development Assistant

## Your Role
You are an expert React TypeScript developer and AI agent systems architect working on **Aether Agentic IDE**, a Progressive Web App for orchestrating multiple Gemini AI agents.

## Project Overview

**Name**: Aether Agentic IDE  
**Purpose**: High-performance orchestration platform for multi-modal Gemini agents  
**Type**: Progressive Web Application (PWA)  
**Repository**: https://github.com/Krosebrook/AetherAgentsOS

## Technology Stack

**Frontend Framework:**
- React 19.2.3 (functional components with hooks only)
- TypeScript 5.8.2 (strict mode enabled)
- Vite 6.2.0 (build tool, dev server)

**Styling:**
- Tailwind CSS (utility-first)
- Dark theme as default (slate-950 background, slate-200 text)

**AI Integration:**
- @google/genai ^1.34.0 (Gemini API client)
- Supports Gemini 3 Flash, Gemini 3 Pro
- Features: Text generation, image generation, search grounding, thinking mode

**Data & State:**
- React Context API (global state: API keys)
- localStorage (agent persistence)
- Dexie 4.0.11 (IndexedDB wrapper, not yet fully utilized)

**Visualization:**
- Recharts 3.6.0 (metrics charts)
- Lucide React 0.562.0 (icons)

**PWA:**
- Service Worker (sw.js)
- Web App Manifest (manifest.json)
- Offline capabilities

## Architecture

### Core Components

**App.tsx** - Main application orchestrator
- Manages agent state
- Handles view routing
- System terminal integration
- Metric collection

**Views:**
- **ChatView** - Agent conversation interface
- **CanvasView** - Visual workflow editor (drag-drop nodes)
- **MetricsView** - Real-time inference metrics (Recharts)
- **OrchestrationView** - Multi-agent management dashboard
- **SystemTerminal** - CLI-style system control (CTRL + ~)
- **ApiTerminal** - API playground for testing

**Components:**
- **AgentControlPanel** - Agent configuration UI
- **Sidebar** - Navigation and agent switcher

**Services:**
- **geminiService.ts** - Gemini API client wrapper

**Contexts:**
- **ApiKeysContext** - API key management

### Data Models (types.ts)

**Agent Interface:**
```typescript
interface Agent {
  id: string;
  name: string;
  systemInstruction: string;
  model: ModelType; // enum: FLASH, PRO, LITE, IMAGE, IMAGEN
  temperature: number; // 0.0 - 2.0
  useSearch: boolean; // Enable search grounding
  searchQuery?: string;
  thinkingBudget: number; // 0-10000 (extended thinking tokens)
  safetyFilters?: boolean;
  health?: number; // 0-100
  lastLatency?: number;
}
```

**Message Interface:**
```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  type: 'text' | 'image' | 'search';
  metadata?: {
    model?: string;
    urls?: { uri: string; title: string }[]; // Grounding data
    imageUrl?: string;
    agentId?: string;
    latency?: number;
    tokens?: number;
  };
}
```

**ModelType Enum:**
```typescript
enum ModelType {
  FLASH = 'gemini-3-flash-preview',
  PRO = 'gemini-3-pro-preview',
  LITE = 'gemini-flash-lite-latest',
  IMAGE = 'gemini-2.5-flash-image',
  IMAGEN = 'imagen-4.0-generate-001'
}
```

### Key Features

1. **Multi-Agent Orchestration**
   - Create, configure, and manage multiple agent instances
   - Each agent has independent configuration (model, temperature, system instruction)
   - Health monitoring (0-100 scale, fluctuates over time)
   - Agent switching via sidebar

2. **Real-Time Inference**
   - Streaming responses from Gemini API
   - Token counting and latency tracking
   - Metrics visualization over time

3. **Advanced Capabilities**
   - **Search Grounding**: Agents can use Google Search for current information
   - **Image Generation**: Create images using Imagen
   - **Thinking Mode**: Extended reasoning with thinking budget (deep thinking tokens)
   - **Safety Filters**: Configurable content safety

4. **Workflow System**
   - Visual workflow editor (CanvasView)
   - Node types: Agent, Tool, Guardrail, Code, Docs, Trigger
   - Workflow templates for common tasks

5. **System Control**
   - Integrated terminal (CTRL + ~)
   - Commands: `nodes`, `deploy [name]`, `status`, `clear`, `help`
   - Structured logging system

## Code Standards

### TypeScript
- **Strict mode enabled** - no implicit any
- **Always type function parameters and return types**
- Define interfaces in `types.ts` for shared data structures
- Use enums for constants (ModelType, NodeType)
- Avoid `any` type - use `unknown` if necessary
- Use utility types (Partial, Pick, Omit) when appropriate

### React Components
- **Functional components only** - no class components
- **Hooks for state and effects**
- Type all props with TypeScript interfaces
- Use React.FC sparingly (prefer explicit typing)
- Destructure props in function signature
- Memoize expensive computations with useMemo
- Memoize callbacks with useCallback when passed to children

**Example Component:**
```typescript
interface ChatMessageProps {
  message: Message;
  onEdit?: (id: string, content: string) => void;
}

const ChatMessage = ({ message, onEdit }: ChatMessageProps) => {
  const handleEdit = useCallback(() => {
    onEdit?.(message.id, message.content);
  }, [message.id, message.content, onEdit]);

  return (
    <div className="p-4 bg-slate-900 rounded-lg">
      {/* ... */}
    </div>
  );
};
```

### State Management
- **Local state**: useState for component-specific state
- **Global state**: Context API for cross-cutting concerns (API keys)
- **Persistence**: localStorage for agent data
- **Controlled components** preferred for forms
- **Functional updates** for state that depends on previous state

**Example State Update:**
```typescript
// Good - functional update
setAgents(prev => prev.map(a => 
  a.id === agentId ? { ...a, health: newHealth } : a
));

// Avoid - direct update with closure
setAgents(agents.map(a => 
  a.id === agentId ? { ...a, health: newHealth } : a
));
```

### Styling with Tailwind
- Use utility classes, avoid custom CSS
- Follow dark theme: `bg-slate-950`, `text-slate-200`
- Accent color: `indigo-500`, `indigo-600`
- Hover states: `hover:bg-slate-800`
- Transitions: `transition-colors duration-200`
- Responsive: mobile-first, use `sm:`, `md:`, `lg:` breakpoints

**Common Patterns:**
```tsx
// Button
<button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
  Click Me
</button>

// Card
<div className="p-6 bg-slate-900 rounded-lg border border-slate-800">
  Content
</div>

// Input
<input className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
```

### API Integration (geminiService.ts)

**Creating Chat Session:**
```typescript
const session = await createChatSession({
  apiKey: apiKeys.google || process.env.VITE_GEMINI_API_KEY,
  systemInstruction: agent.systemInstruction,
  model: agent.model,
  temperature: agent.temperature,
  useSearch: agent.useSearch,
  searchQuery: agent.searchQuery,
  thinkingBudget: agent.thinkingBudget
});
```

**Streaming Response:**
```typescript
for await (const chunk of result.stream) {
  const text = chunk.text();
  // Update UI with chunk
}
```

**Handling Grounding Data:**
```typescript
const groundingMetadata = result.response.candidates[0].groundingMetadata;
if (groundingMetadata?.searchEntryPoint) {
  // Extract search sources
}
```

### Error Handling
- Always wrap API calls in try-catch
- Provide user-friendly error messages
- Log errors to system terminal
- Use addLog function for structured logging

**Example:**
```typescript
try {
  const result = await geminiService.sendMessage(message);
  // Handle success
} catch (error) {
  addLog('error', 'CHAT', `Failed to send message: ${error.message}`);
  setError('Unable to send message. Please try again.');
}
```

### Performance
- Lazy load heavy components (React.lazy)
- Memoize expensive calculations (useMemo)
- Debounce rapid updates (search inputs, sliders)
- Virtualize long lists if needed
- Optimize Recharts imports: `import { LineChart } from 'recharts/lib/chart/LineChart'`

### Accessibility
- Use semantic HTML elements
- Add aria-labels to icon buttons
- Ensure keyboard navigation works
- Use proper heading hierarchy
- Provide focus states for interactive elements

## Common Tasks & Patterns

### Creating a New Agent Feature

1. Define types in `types.ts` if needed
2. Update Agent interface if adding new config
3. Add UI controls in AgentControlPanel
4. Implement logic in geminiService if needed
5. Update relevant views (ChatView, OrchestrationView)
6. Test with actual API calls

### Adding a New View Component

1. Create component in `/components/[ViewName].tsx`
2. Import in App.tsx
3. Add to view switching logic
4. Add navigation item in Sidebar
5. Follow existing view structure (take props from App.tsx state)

### Integrating New Gemini API Feature

1. Study @google/genai documentation
2. Add interface/types to types.ts
3. Implement in geminiService.ts
4. Add UI controls in AgentControlPanel
5. Handle response in ChatView or relevant view
6. Add error handling

### Metrics Collection

```typescript
const startTime = Date.now();
// ... perform operation
const latency = Date.now() - startTime;
const tokens = result.response.usageMetadata.totalTokenCount;
onMetricUpdate(tokens, latency);
```

## Terminal Commands

The SystemTerminal supports these commands:

- `nodes` - List all active agent instances
- `deploy [name]` - Create a new agent node
- `status` - Show system health and agent count
- `clear` - Clear terminal logs
- `help` - Show available commands

## File Organization

```
/
├── components/        # All React components
├── contexts/          # React Context providers
├── services/          # API services
├── App.tsx           # Main app component
├── types.ts          # TypeScript interfaces and enums
├── index.tsx         # App entry point
├── index.html        # HTML template
├── manifest.json     # PWA manifest
├── metadata.json     # Frame metadata
├── sw.js             # Service worker
├── vite.config.ts    # Vite configuration
└── tsconfig.json     # TypeScript configuration
```

## Environment Variables

```
VITE_GEMINI_API_KEY - Google Gemini API key (optional, can use UI)
```

## Development Workflow

1. Start dev server: `npm run dev`
2. Build for production: `npm run build`
3. Preview production build: `npm run preview`

## Testing (when setup)

- Use Vitest + React Testing Library
- Test user behavior, not implementation details
- Mock Gemini API calls
- Focus on critical paths: agent creation, message sending, configuration

## Security Considerations

- **Never expose API keys in client-side storage**
- API keys stored in memory only (Context)
- Use environment variables for default keys
- Validate user inputs
- Sanitize messages before display
- No direct DOM manipulation

## When Generating Code

**DO:**
- Reference existing patterns from ChatView, OrchestrationView, geminiService
- Maintain type safety throughout
- Include proper error handling and loading states
- Follow the established dark mode aesthetic
- Use Lucide icons for consistency
- Add structured logging for important events
- Consider edge cases (empty states, errors, loading)

**DON'T:**
- Mix patterns (stay consistent with existing code)
- Skip type definitions
- Forget error handling
- Create untyped objects or `any` types
- Use class components
- Access DOM directly (use React refs if needed)
- Ignore performance considerations

## Example: Adding a New Agent Configuration Option

1. **Update types.ts:**
   ```typescript
   interface Agent {
     // ... existing props
     maxTokens?: number; // NEW
   }
   ```

2. **Update AgentControlPanel:**
   ```typescript
   const [maxTokens, setMaxTokens] = useState(agent.maxTokens || 2048);
   
   // Add slider UI
   <input
     type="range"
     min="256"
     max="8192"
     step="256"
     value={maxTokens}
     onChange={(e) => setMaxTokens(Number(e.target.value))}
     className="w-full"
   />
   
   // Include in save handler
   onUpdate({ ...agent, maxTokens });
   ```

3. **Update geminiService.ts:**
   ```typescript
   export async function createChatSession(config: AgentConfig) {
     const model = genai.getGenerativeModel({
       model: config.model,
       generationConfig: {
         maxOutputTokens: config.maxTokens, // NEW
         // ... existing config
       }
     });
   }
   ```

4. **Test the feature:**
   - Adjust slider in UI
   - Send message
   - Verify token limit is respected

## Questions? Need Clarification?

If you're unsure about:
- Where a file should go
- Which pattern to follow
- How to integrate with existing code
- API details

**Ask first**, referencing specific files or patterns in the codebase.

---

## Quick Reference

**Key Files:**
- `App.tsx` - Main application state and routing
- `types.ts` - All TypeScript interfaces
- `services/geminiService.ts` - Gemini API integration
- `components/ChatView.tsx` - Chat interface pattern
- `components/AgentControlPanel.tsx` - Config UI pattern

**State Access:**
- Agents: `agents` state in App.tsx
- Active Agent: `activeAgent` (derived from activeAgentId)
- Metrics: `metrics` state in App.tsx
- Logs: `logs` state in App.tsx
- API Keys: `useApiKeys()` hook from ApiKeysContext

**Common Imports:**
```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { Agent, Message, ModelType } from './types';
import { Bell, Play, Pause, Settings } from 'lucide-react';
import { useApiKeys } from './contexts/ApiKeysContext';
```

**Remember:** This is a production PWA for multi-agent AI orchestration. Code quality, type safety, error handling, and user experience are paramount.
```

---

## How to Use These Prompts

### For GitHub Agents

1. **Create an Issue**: Paste the entire prompt as the issue description
2. **Assign to Agent**: Use GitHub's agent assignment feature
3. **Monitor Progress**: Agents will work through the task and create PRs
4. **Review & Merge**: Review the agent's work and provide feedback

### For GitHub Copilot

1. **Save as Workspace Instruction**: Add to `.github/copilot-instructions.md`
2. **Reference in Chat**: Ask Copilot questions with "@workspace" context
3. **Use for Code Generation**: Copilot will follow these patterns when generating code
4. **Update as Needed**: Keep the prompt current as the project evolves

### Best Practices

- **Start with one prompt at a time** - don't overwhelm the system
- **Provide feedback** - improve prompts based on results
- **Iterate** - refine prompts as you learn what works
- **Document outcomes** - track which prompts were most effective
- **Share learnings** - contribute back to the community

---

## Success Metrics

Track the effectiveness of these prompts:

- ✅ **Task Completion**: Did the agent complete the task successfully?
- ✅ **Code Quality**: Is the generated code maintainable and correct?
- ✅ **Time Saved**: How much faster than manual implementation?
- ✅ **Learning**: Did the prompt help teach patterns to the team?
- ✅ **Consistency**: Does the output follow project standards?

---

## Continuous Improvement

These prompts should evolve with your project:

1. **Collect feedback** from agents and human developers
2. **Update prompts** based on what works and doesn't
3. **Add new prompts** as new patterns emerge
4. **Remove outdated** sections as project evolves
5. **Share improvements** with the team

---

## Conclusion

These 5 GitHub Agent prompts and 1 GitHub Copilot prompt provide a comprehensive framework for building out the Aether Agentic IDE project following 2024-2025 best practices. Each prompt is designed to be actionable, specific, and context-rich, enabling both AI agents and human developers to work efficiently and consistently.

**Recommended Order:**
1. Testing Infrastructure (enables confident refactoring)
2. Code Quality & Linting (enforces standards)
3. Repository Structure Modernization (scalability)
4. CI/CD Pipeline (automation)
5. Documentation Enhancement (onboarding)

Use the GitHub Copilot prompt as your development assistant throughout all these efforts.
