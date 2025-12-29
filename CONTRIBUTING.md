# Contributing to Aether Agentic IDE

Thank you for your interest in contributing to Aether Agentic IDE! We welcome contributions from the community.

## Code of Conduct

This project and everyone participating in it is governed by our commitment to fostering an open and welcoming environment. Please be respectful and considerate in all interactions.

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- A Gemini API key from Google AI Studio

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/YOUR_USERNAME/AetherAgentsOS.git
   cd AetherAgentsOS
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment**
   Create a `.env` file in the root directory:
   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   Open http://localhost:5173 in your browser

5. **Build for Production**
   ```bash
   npm run build
   ```

## Development Workflow

### Creating a Branch

Create a feature branch from `main`:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests

### Making Changes

1. **Write Quality Code**
   - Follow the existing code style
   - Use TypeScript strict mode
   - Write functional components with hooks
   - Add proper TypeScript types for all functions and components

2. **Test Your Changes** (when testing infrastructure is available)
   ```bash
   npm run test
   npm run build
   ```

3. **Follow the Style Guide**
   - Use Tailwind CSS utility classes
   - Follow dark theme conventions (slate-950, slate-800)
   - Use Lucide React for icons
   - Keep components focused and single-purpose

### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semicolons, etc.)
- `refactor`: Code refactoring without changing functionality
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates

**Examples:**
```
feat(chat): add streaming response support
fix(agents): correct health calculation logic
docs(readme): update installation instructions
refactor(terminal): extract command parser logic
```

### Pull Requests

1. **Before Submitting**
   - Ensure your code builds: `npm run build`
   - Test the application manually
   - Update documentation if needed
   - Check for TypeScript errors

2. **Create Pull Request**
   - Push your branch to your fork
   - Create a PR against the `main` branch
   - Fill out the PR template completely
   - Link related issues

3. **PR Title Format**
   ```
   <type>(<scope>): <description>
   ```
   Example: `feat(metrics): add real-time latency visualization`

4. **PR Description Should Include**
   - What changes were made
   - Why these changes are necessary
   - How to test the changes
   - Screenshots/videos for UI changes
   - Breaking changes (if any)

## Code Standards

### TypeScript

- **Use strict typing**: No `any` types without justification
- **Define interfaces**: Create interfaces for all data structures
- **Type function signatures**: Always type parameters and return values
- **Use enums**: For constants and fixed sets of values

**Example:**
```typescript
interface AgentConfig {
  name: string;
  model: ModelType;
  temperature: number;
}

function createAgent(config: AgentConfig): Agent {
  // Implementation
}
```

### React Components

- **Functional components only**: No class components
- **Hooks for state**: Use useState, useEffect, useCallback, useMemo
- **Type all props**: Create interfaces for component props
- **Destructure props**: In function signature for clarity

**Example:**
```typescript
interface ChatViewProps {
  agent: Agent;
  onMetricUpdate: (tokens: number, latency: number) => void;
  onLog: (level: LogLevel, source: string, message: string) => void;
}

const ChatView = ({ agent, onMetricUpdate, onLog }: ChatViewProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Component implementation
  
  return (
    <div className="flex flex-col h-full">
      {/* Component JSX */}
    </div>
  );
};
```

### File Organization

- Place components in `/components` directory
- One component per file
- Use PascalCase for component files: `ChatView.tsx`
- Use camelCase for utility files: `geminiService.ts`
- Co-locate related files when appropriate

### Styling with Tailwind

- **Use utility classes**: Avoid custom CSS
- **Dark theme palette**: 
  - Background: `bg-slate-950`, `bg-slate-900`, `bg-slate-800`
  - Text: `text-slate-200`, `text-slate-300`
  - Accent: `indigo-500`, `indigo-600`
- **Responsive design**: Mobile-first, use breakpoints
- **Hover states**: Add transitions for smooth UX

**Example:**
```tsx
<button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors duration-200">
  Send Message
</button>
```

### Error Handling

- Always wrap API calls in try-catch blocks
- Provide user-friendly error messages
- Log errors using the logging system
- Handle loading and error states in UI

**Example:**
```typescript
try {
  const result = await geminiService.sendMessage(message);
  setResponse(result);
} catch (error) {
  onLog('error', 'CHAT', `Failed to send message: ${error.message}`);
  setError('Unable to send message. Please check your connection and try again.');
}
```

## Project Structure

```
/
├── components/           # React components
│   ├── AgentControlPanel.tsx
│   ├── ChatView.tsx
│   ├── CanvasView.tsx
│   ├── MetricsView.tsx
│   ├── OrchestrationView.tsx
│   ├── Sidebar.tsx
│   ├── SystemTerminal.tsx
│   └── ApiTerminal.tsx
├── contexts/            # React Context providers
│   └── ApiKeysContext.tsx
├── services/            # API services
│   └── geminiService.ts
├── types.ts             # TypeScript type definitions
├── App.tsx              # Main application component
├── index.tsx            # Application entry point
├── index.html           # HTML template
├── manifest.json        # PWA manifest
├── sw.js                # Service worker
├── vite.config.ts       # Vite configuration
└── tsconfig.json        # TypeScript configuration
```

## What to Contribute

### Good First Issues

Look for issues labeled `good first issue` - these are great starting points for new contributors.

### Areas We Need Help With

- **Testing**: Setting up Vitest and writing tests
- **Documentation**: Improving docs and adding examples
- **UI/UX**: Enhancing the user interface and experience
- **Features**: New agent types, workflow templates, visualizations
- **Performance**: Optimizing rendering and API calls
- **Accessibility**: Improving keyboard navigation and screen reader support

### Feature Requests

Have an idea? Open an issue first to discuss:
1. Describe the feature and use case
2. Explain why it would be valuable
3. Discuss potential implementation approaches

## Questions or Problems?

- **Bug reports**: Open an issue with the bug report template
- **Feature requests**: Open an issue with the feature request template
- **Questions**: Start a discussion in GitHub Discussions
- **Security issues**: See SECURITY.md for responsible disclosure

## Recognition

Contributors will be recognized in:
- The project README
- Release notes for significant contributions
- GitHub's contributor graph

Thank you for contributing to Aether Agentic IDE! 🚀
