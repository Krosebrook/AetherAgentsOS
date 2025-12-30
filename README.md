# Aether Agentic IDE

> A high-performance orchestration platform for multi-modal Gemini agents

Build, orchestrate, and monitor multiple AI agents working together to solve complex problems. Built as a Progressive Web App with real-time collaboration and visual workflow design.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)

## ✨ Features

### 🤖 Multi-Agent Orchestration
- Create and manage multiple specialized AI agents
- Real-time health monitoring and metrics
- Agent-specific configurations and personalities
- Support for Gemini 3 Flash, Pro, and Lite models

### 🎨 Visual Workflow Designer
- Drag-and-drop canvas for building agent workflows
- Pre-built templates (Research, Security Audit, etc.)
- Connect agents, tools, and guardrails visually
- Simulate and test workflows before deployment

### 📊 Real-Time Metrics
- Token usage tracking
- Latency monitoring
- Performance analytics
- Historical metrics visualization

### 💻 Integrated Terminal
- CLI commands for agent management
- System logs and event tracking
- Quick access with `CTRL + ~`

### 🔒 Security First
- Environment variable API key management
- IndexedDB encryption for sensitive data
- No key exposure in localStorage
- Content Security Policy ready

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Google Gemini API key ([Get one here](https://aistudio.google.com/))

### Installation

```bash
# Clone the repository
git clone https://github.com/Krosebrook/AetherAgentsOS.git
cd AetherAgentsOS

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env and add your Gemini API key

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

## 📖 Documentation

- **[Quick Start Guide](./QUICK_START.md)** - Get started in 5 minutes
- **[Agent Documentation](./docs/agents.md)** - Complete agent system guide
- **[Gemini Integration](./docs/gemini.md)** - API configuration and best practices
- **[Architecture](./docs/ARCHITECTURE.md)** - System design and technical details
- **[Contributing](./CONTRIBUTING.md)** - How to contribute
- **[Security](./SECURITY.md)** - Security policy and best practices
- **[Changelog](./CHANGELOG.md)** - Version history
- **[Roadmap](./ROADMAP.md)** - Future plans and milestones

## 🎯 Use Cases

### Research Assistant
Create an agent that searches the web, synthesizes information, and generates structured reports.

### Code Reviewer
Build a security-focused agent that audits code for vulnerabilities and suggests fixes.

### Customer Support
Deploy specialized agents that handle support tickets with context-aware responses.

### Content Creator
Orchestrate multiple agents for research, writing, editing, and optimization.

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│        React 19 + TypeScript            │
│  (Components, Hooks, Context API)       │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│         Gemini Service Layer            │
│  (API Integration, Streaming, Errors)   │
└─────────────────┬───────────────────────┘
                  │
┌─────────────────▼───────────────────────┐
│  Persistence (localStorage + IndexedDB) │
└─────────────────────────────────────────┘
```

**Tech Stack:**
- Frontend: React 19, TypeScript, Tailwind CSS
- Build: Vite 6.2
- AI: Google Gemini API (@google/genai)
- Storage: IndexedDB (Dexie), localStorage
- Charts: Recharts
- PWA: Service Worker + Manifest

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed design.

## 🎮 Terminal Commands

Access the terminal with `CTRL + ~`:

| Command | Description |
|---------|-------------|
| `nodes` | List all active agent instances |
| `deploy [name]` | Create a new agent node |
| `status` | Check system health and statistics |
| `clear` | Clear log history |
| `help` | Show available commands |

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](./CONTRIBUTING.md) for details.

### Development Setup

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit with conventional commits (`git commit -m 'feat: add amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

### Code Style

- TypeScript strict mode
- Functional components with hooks
- Tailwind CSS utility classes
- Conventional commits

## 🗺️ Roadmap

### v0.1.0 - Foundation (Q1 2025)
- ✅ Testing infrastructure (Vitest)
- ✅ ESLint + Prettier
- ✅ CI/CD pipelines

### v0.2.0 - Structure (Q1 2025)
- Feature-based architecture
- Enhanced error handling
- Performance optimizations

### v1.0.0 - Production Ready (Q3 2025)
- Multi-provider LLM support
- Plugin system
- Real-time collaboration
- Enterprise features

See [ROADMAP.md](./ROADMAP.md) for complete plan.

## 📊 Project Status

**Current Version:** 0.0.0 (MVP)  
**Status:** Active Development  
**Last Updated:** December 29, 2024

### What's Working
✅ Multi-agent management  
✅ Chat interface with streaming  
✅ Visual workflow canvas  
✅ Metrics tracking  
✅ PWA support

### What's Coming
🔄 Automated testing  
🔄 Code quality tools  
🔄 Advanced workflows  
🔄 Multi-provider support

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

- [Google Gemini](https://ai.google.dev/) for the AI API
- [React Team](https://react.dev/) for React 19
- [Vercel](https://vercel.com/) for Vite
- [Tailwind Labs](https://tailwindcss.com/) for Tailwind CSS
- Community contributors and supporters

## 📞 Support

- **Documentation:** [Quick Start](./QUICK_START.md) | [Full Docs](./docs/)
- **Issues:** [GitHub Issues](https://github.com/Krosebrook/AetherAgentsOS/issues)
- **Discussions:** [GitHub Discussions](https://github.com/Krosebrook/AetherAgentsOS/discussions)
- **Security:** See [SECURITY.md](./SECURITY.md)

## ⭐ Star History

If you find this project useful, please consider giving it a star!

---

**Built with ❤️ by the Aether community**
