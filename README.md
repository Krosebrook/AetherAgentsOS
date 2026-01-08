
# Aether Agentic IDE

A high-performance orchestration platform for multi-modal Gemini agents. Built as a PWA with local persistence and a real-time command terminal.

## Architecture
- **Framework**: React 19 + Tailwind CSS
- **PWA**: Service Worker (`sw.js`) + Manifest (`manifest.json`)
- **Engine**: `@google/genai` (Gemini 3 Flash/Pro)
- **Visuals**: Recharts (Telemetry) + Lucide (Iconography)

## Features
- **Workflow Engine**: Industrial templates for market research, security auditing, and risk management.
- **Node Orchestrator**: Multi-agent instance management with health tracking.
- **Aether CLI**: Integrated terminal for system-level control.
- **Inference Metrics**: Real-time latency and token density monitoring.

## Command Line Usage
Access the terminal (`CTRL + ~`) and use:
- `nodes`: List all active agent instances.
- `deploy [name]`: Provision a new agent node.
- `status`: Check global system health.
- `clear`: Purge log history.

## Testing
Run the test suite with:
```bash
npm test                  # Run tests once
npm run test:watch        # Run tests in watch mode
npm run test:coverage     # Run tests with coverage report
```

See [TESTING.md](./TESTING.md) for detailed testing documentation.

## Security
API keys are handled exclusively via server-side injection (`process.env.API_KEY`) and are never exposed to the frontend persistent storage layers.
