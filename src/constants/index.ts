/**
 * @fileoverview Application constants and configuration values
 * @module constants
 */

import { ModelType, NodeType, WorkflowTemplate } from '../types';

// =============================================================================
// APPLICATION METADATA
// =============================================================================

export const APP_NAME = 'AetherAgentsOS';
export const APP_VERSION = '0.1.0';
export const APP_DESCRIPTION = 'High-performance orchestration platform for multi-modal AI agents';

// =============================================================================
// STORAGE KEYS
// =============================================================================

export const STORAGE_KEYS = {
  AGENTS: 'aether_agents',
  METRICS: 'aether_metrics',
  SETTINGS: 'aether_settings',
  THEME: 'aether_theme',
} as const;

// =============================================================================
// API CONFIGURATION
// =============================================================================

export const API_CONFIG = {
  /** Maximum retries for failed API calls */
  MAX_RETRIES: 3,
  /** Base delay for exponential backoff (ms) */
  RETRY_DELAY: 1000,
  /** Default timeout for API calls (ms) */
  TIMEOUT: 30000,
  /** Maximum tokens for response */
  MAX_TOKENS: 8192,
} as const;

// =============================================================================
// MODEL CONFIGURATION
// =============================================================================

/**
 * Fallback chain for text generation
 */
export const TEXT_FALLBACK_CHAIN = [
  ModelType.FLASH,
  ModelType.PRO,
  ModelType.LITE,
] as const;

/**
 * Model display information
 */
export const MODEL_INFO = {
  [ModelType.FLASH]: {
    label: 'Gemini 3 Flash',
    description: 'High speed, balanced latency',
    color: 'amber',
    supportsThinking: true,
    supportsSearch: true,
  },
  [ModelType.PRO]: {
    label: 'Gemini 3 Pro',
    description: 'Advanced reasoning & complex logic',
    color: 'indigo',
    supportsThinking: true,
    supportsSearch: true,
  },
  [ModelType.LITE]: {
    label: 'Gemini Flash Lite',
    description: 'Optimized for high-efficiency',
    color: 'slate',
    supportsThinking: true,
    supportsSearch: false,
  },
  [ModelType.IMAGE]: {
    label: 'Gemini 2.5 Flash Image',
    description: 'Image understanding',
    color: 'emerald',
    supportsThinking: false,
    supportsSearch: false,
  },
  [ModelType.IMAGEN]: {
    label: 'Imagen 4.0',
    description: 'Image generation',
    color: 'purple',
    supportsThinking: false,
    supportsSearch: false,
  },
} as const;

// =============================================================================
// AGENT DEFAULTS
// =============================================================================

export const DEFAULT_AGENT = {
  name: 'Aether Core',
  systemInstruction: 'You are an advanced AI operations agent. Provide precise, technical, and high-quality responses.',
  model: ModelType.FLASH,
  temperature: 0.7,
  useSearch: false,
  thinkingBudget: 0,
  health: 100,
} as const;

export const AGENT_LIMITS = {
  /** Maximum number of agents */
  MAX_AGENTS: 20,
  /** Maximum thinking budget tokens */
  MAX_THINKING_BUDGET: 32768,
  /** Minimum temperature */
  MIN_TEMPERATURE: 0,
  /** Maximum temperature */
  MAX_TEMPERATURE: 2,
  /** Maximum system instruction length */
  MAX_INSTRUCTION_LENGTH: 32000,
  /** Health update interval (ms) */
  HEALTH_UPDATE_INTERVAL: 5000,
} as const;

// =============================================================================
// UI CONFIGURATION
// =============================================================================

export const UI_CONFIG = {
  /** Maximum log entries to retain */
  MAX_LOG_ENTRIES: 200,
  /** Maximum metrics data points */
  MAX_METRICS_POINTS: 100,
  /** Scroll animation behavior */
  SCROLL_BEHAVIOR: 'smooth' as const,
  /** Terminal animation duration */
  TERMINAL_ANIMATION_MS: 300,
} as const;

// =============================================================================
// TERMINAL COMMANDS
// =============================================================================

export const TERMINAL_COMMANDS = {
  NODES: 'nodes',
  DEPLOY: 'deploy',
  CLEAR: 'clear',
  STATUS: 'status',
  HELP: 'help',
} as const;

export const TERMINAL_HELP_TEXT = `
Available Commands:
  nodes          - List all active agent instances
  deploy [name]  - Provision a new agent node
  status         - Check global system health
  clear          - Purge log history
  help           - Display this help message
`.trim();

// =============================================================================
// SUPPORTED PROVIDERS
// =============================================================================

export const SUPPORTED_PROVIDERS = [
  'anthropic',
  'mistral',
  'cohere',
  'deepseek',
  'perplexity',
  'groq',
  'xai',
  'together',
  'fireworks',
  'cerebras',
  'sambanova',
  'novita',
  'replicate',
  'huggingface',
  'voyage',
  'jina',
  'ollama',
  'openrouter',
] as const;

export type SupportedProvider = typeof SUPPORTED_PROVIDERS[number];

// =============================================================================
// WORKFLOW TEMPLATES
// =============================================================================

export const INDUSTRIAL_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'researcher',
    name: 'Autonomous Researcher',
    description: 'Scrapes competitors, synthesizes market gaps, and outputs analysis.',
    nodes: [
      {
        id: '1',
        type: NodeType.TRIGGER,
        label: 'Topic Input',
        position: { x: 50, y: 150 },
        data: { temperature: 0.7 }
      },
      {
        id: '2',
        type: NodeType.TOOL,
        label: 'Search Engine',
        position: { x: 260, y: 50 },
        data: { toolType: 'search' }
      },
      {
        id: '3',
        type: NodeType.AGENT,
        label: 'Synthesis Pro',
        position: { x: 480, y: 150 },
        data: {
          instruction: 'Summarize results.',
          model: ModelType.PRO,
          thinkingBudget: 4096
        }
      },
      {
        id: '4',
        type: NodeType.DOCS,
        label: 'Report Gen',
        position: { x: 720, y: 150 },
        data: { instruction: 'Markdown format.' }
      }
    ],
    edges: [
      { id: 'e1', source: '1', target: '2' },
      { id: 'e2', source: '2', target: '3' },
      { id: 'e3', source: '3', target: '4' }
    ]
  },
  {
    id: 'code-audit',
    name: 'Security Auditor',
    description: 'Analyzes code for vulnerabilities and suggests patches.',
    nodes: [
      {
        id: 'c1',
        type: NodeType.TRIGGER,
        label: 'Git Hook',
        position: { x: 50, y: 150 },
        data: {}
      },
      {
        id: 'c2',
        type: NodeType.AGENT,
        label: 'Sec Lead',
        position: { x: 300, y: 150 },
        data: { instruction: 'Audit diff.', model: ModelType.PRO }
      },
      {
        id: 'c3',
        type: NodeType.GUARDRAIL,
        label: 'Rules Engine',
        position: { x: 300, y: 300 },
        data: { rules: ['OWASP Top 10'] }
      },
      {
        id: 'c4',
        type: NodeType.CODE,
        label: 'Patch Fix',
        position: { x: 550, y: 150 },
        data: { code: 'function fix(v) { return v; }' }
      }
    ],
    edges: [
      { id: 'ce1', source: 'c1', target: 'c2' },
      { id: 'ce2', source: 'c2', target: 'c4' },
      { id: 'ce3', source: 'c3', target: 'c2' }
    ]
  },
  {
    id: 'data-pipeline',
    name: 'Data Pipeline',
    description: 'ETL pipeline with validation and transformation stages.',
    nodes: [
      {
        id: 'd1',
        type: NodeType.TRIGGER,
        label: 'Data Input',
        position: { x: 50, y: 150 },
        data: {}
      },
      {
        id: 'd2',
        type: NodeType.GUARDRAIL,
        label: 'Validator',
        position: { x: 250, y: 150 },
        data: { rules: ['Schema validation', 'Type checking'] }
      },
      {
        id: 'd3',
        type: NodeType.CODE,
        label: 'Transform',
        position: { x: 450, y: 150 },
        data: { code: 'transform(data)' }
      },
      {
        id: 'd4',
        type: NodeType.AGENT,
        label: 'Analyzer',
        position: { x: 650, y: 150 },
        data: { instruction: 'Analyze patterns.', model: ModelType.FLASH }
      }
    ],
    edges: [
      { id: 'de1', source: 'd1', target: 'd2' },
      { id: 'de2', source: 'd2', target: 'd3' },
      { id: 'de3', source: 'd3', target: 'd4' }
    ]
  }
];

// =============================================================================
// ERROR CODES
// =============================================================================

export const ERROR_CODES = {
  INVALID_ARGUMENTS: 'INVALID_ARGUMENTS',
  MISSING_PROMPT: 'MISSING_PROMPT',
  AUTH_REQUIRED: 'AUTH_REQUIRED',
  UNKNOWN_COMMAND: 'UNKNOWN_COMMAND',
  RATE_LIMITED: 'RATE_LIMITED',
  SAFETY_BLOCKED: 'SAFETY_BLOCKED',
  REGION_RESTRICTED: 'REGION_RESTRICTED',
  API_KEY_MISSING: 'API_KEY_MISSING',
  NETWORK_ERROR: 'NETWORK_ERROR',
  ENGINE_FAULT: 'ENGINE_FAULT',
} as const;

// =============================================================================
// KEYBOARD SHORTCUTS
// =============================================================================

export const KEYBOARD_SHORTCUTS = {
  TOGGLE_TERMINAL: 'ctrl+`',
  NEW_AGENT: 'ctrl+n',
  FOCUS_CHAT: 'ctrl+/',
  CLEAR_LOGS: 'ctrl+l',
} as const;
